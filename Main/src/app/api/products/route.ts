import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stock: true,
        marketplaceProducts: {
          include: { marketplace: { select: { type: true, shopName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ GET /api/products error:', error);
    return NextResponse.json({ error: 'Gagal memuat data produk' }, { status: 500 });
  }
}