import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit') || 50);

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const logs = await prisma.syncLog.findMany({
      where,
      include: { marketplace: { select: { type: true, shopName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('❌ GET /api/sync/logs error:', error);
    return NextResponse.json({ error: 'Gagal memuat log sinkronisasi' }, { status: 500 });
  }
}