import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ Next.js 15: params bertipe Promise, wajib di-await
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Unwrap params promise
    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'ID produk tidak valid' }, { status: 400 });
    }

    const { quantity, tokopediaItemId, shopeeItemId } = await req.json();

    await prisma.$transaction(async (tx) => {
      // 2. Update/Upsert Stok Fisik
      if (quantity !== undefined) {
        await tx.stock.upsert({
          where: { productId },
          create: { productId, quantity },
          update: { quantity }
        });
      }

      // 3. Mapping Tokopedia
      if (tokopediaItemId?.trim()) {
        const mpTokped = await tx.marketplace.findFirst({ where: { type: 'TOKOPEDIA' } });
        if (mpTokped) {
          await tx.marketplaceProduct.upsert({
            where: { marketplaceId_marketplaceItemId: { marketplaceId: mpTokped.id, marketplaceItemId: tokopediaItemId } },
            create: { marketplaceId: mpTokped.id, productId, marketplaceItemId: tokopediaItemId },
            update: { productId }
          });
        }
      }

      // 4. Mapping Shopee
      if (shopeeItemId?.trim()) {
        const mpShopee = await tx.marketplace.findFirst({ where: { type: 'SHOPEE' } });
        if (mpShopee) {
          await tx.marketplaceProduct.upsert({
            where: { marketplaceId_marketplaceItemId: { marketplaceId: mpShopee.id, marketplaceItemId: shopeeItemId } },
            create: { marketplaceId: mpShopee.id, productId, marketplaceItemId: shopeeItemId },
            update: { productId }
          });
        }
      }
    });

    return NextResponse.json({ message: 'Produk & mapping berhasil diperbarui' });
  } catch (error) {
    console.error('❌ PUT /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}