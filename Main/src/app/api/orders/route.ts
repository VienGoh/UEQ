import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const marketplace = searchParams.get('marketplace');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (marketplace) where.marketplace = { type: marketplace };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { marketplaceOrderId: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        marketplace: { select: { type: true, shopName: true } },
        items: { include: { product: { select: { sku: true, name: true } } } },
      },
      orderBy: { orderedAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('❌ GET /api/orders error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pesanan' }, { status: 500 });
  }
}