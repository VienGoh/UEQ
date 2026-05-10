import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status as OrderStatus;

    if (!newStatus) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Jika status berubah dari NEW → PROCESSING/SHIPPED, kurangi stok fisik
    if (['PROCESSING', 'SHIPPED'].includes(newStatus) && order.status === 'NEW') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const stock = await tx.stock.findUnique({ where: { productId: item.productId } });
          if (!stock || stock.quantity < item.quantity) {
            throw new Error(`Stok tidak cukup untuk produk ID ${item.productId}`);
          }

          await tx.stock.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: Number(id) },
          data: { status: newStatus },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: Number(id) },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ message: 'Status & stok berhasil diperbarui' });
  } catch (error: any) {
    console.error('❌ PUT /api/orders/[id]/status error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui status pesanan' },
      { status: 500 }
    );
  }
}