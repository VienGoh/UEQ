import { prisma } from "@/lib/prisma";
import SyncManager from "@/components/sync-manager";

export default async function SyncPage() {
  try {
    const logs = await prisma.syncLog.findMany({
      include: {
        marketplace: { select: { id: true, type: true, shopName: true } },
        order: { select: { marketplaceOrderId: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    const marketplaces = await prisma.marketplace.findMany({
      select: { id: true, type: true, shopName: true, isActive: true }
    });

    const serializedLogs = JSON.parse(JSON.stringify(logs));
    const serializedMarketplaces = JSON.parse(JSON.stringify(marketplaces));

    return <SyncManager initialLogs={serializedLogs} marketplaces={serializedMarketplaces} />;
  } catch (error) {
    console.error("❌ Gagal memuat data sinkronisasi:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Data Sinkronisasi</h1>
        <p className="text-gray-600 mt-2">Terjadi kesalahan saat mengambil data. Silakan refresh halaman.</p>
      </div>
    );
  }
}