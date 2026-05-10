import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, shopName, shopId, apiKey, apiSecret, accessToken, refreshToken, isActive } = body;

    if (!type || !shopId || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Data wajib tidak lengkap' }, { status: 400 });
    }

    // Cari konfigurasi yang sudah ada berdasarkan tipe marketplace
    const existing = await prisma.marketplace.findFirst({ where: { type } });

    let saved;
    if (existing) {
      saved = await prisma.marketplace.update({
        where: { id: existing.id },
        data: { shopName, shopId, apiKey, apiSecret, accessToken, refreshToken, isActive }
      });
    } else {
      saved = await prisma.marketplace.create({
        data: { type, shopName, shopId, apiKey, apiSecret, accessToken, refreshToken, isActive }
      });
    }

    // 🔗 TODO: Trigger connection test / OAuth handshake di sini
    // const isValid = await testMarketplaceConnection(saved);

    return NextResponse.json({ message: 'Konfigurasi berhasil disimpan', data: saved });
  } catch (error) {
    console.error('❌ POST /api/settings/marketplace error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan konfigurasi' }, { status: 500 });
  }
}