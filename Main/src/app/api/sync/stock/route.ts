import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const marketplaceId = body.marketplaceId ? Number(body.marketplaceId) : null;

    // Ambil semua produk + stok fisik
    const stocks = await prisma.stock.findMany({
      include: { product: { select: { id: true, sku: true, name: true } } },
    });

    // Buat log sinkronisasi
    const log = await prisma.syncLog.create({
      data: {
        marketplaceId,
        type: 'STOCK_PUSH',
        status: 'PENDING',
        payload: JSON.stringify(stocks.map(s => ({ sku: s.product.sku, qty: s.quantity }))),
      },
    });

    // 🔗 TODO: Integrasi API Tokopedia/Shopee di sini
    // Contoh: await pushStockToTokopedia(marketplaceId, stocks);
    // Contoh: await pushStockToShopee(marketplaceId, stocks);

    // Update log menjadi SUCCESS (simulasi)
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: 'SUCCESS', message: 'Sinkronisasi stok berhasil dikirim' },
    });

    return NextResponse.json({ message: 'Sinkronisasi stok dipicu', logId: log.id });
  } catch (error) {
    console.error('❌ POST /api/sync/stock error:', error);
    return NextResponse.json({ error: 'Gagal memicu sinkronisasi stok' }, { status: 500 });
  }
}