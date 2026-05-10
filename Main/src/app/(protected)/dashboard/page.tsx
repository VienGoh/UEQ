// app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  try {
    // ======================
    // DATA UTAMA OMNICHANNEL
    // ======================
    const totalOrders = await prisma.order.count();

    const newOrders = await prisma.order.count({
      where: { status: "NEW" },
    });

    // Stok menipis (≤ 5) untuk alert restock
    const lowStockItems = await prisma.stock.findMany({
      where: { quantity: { lte: 5 } },
      include: { product: true },
    });

    // Hitung tingkat sukses sinkronisasi dari SyncLog
    const syncLogs = await prisma.syncLog.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const totalSyncs = syncLogs.reduce((sum, log) => sum + log._count.id, 0);
    const successSyncs = syncLogs.find((l) => l.status === "SUCCESS")?._count.id || 0;
    const syncSuccessRate = totalSyncs === 0 ? 0 : Math.round((successSyncs / totalSyncs) * 100);

    // Distribusi Pesanan per Marketplace
    const marketplaceOrders = await prisma.order.groupBy({
      by: ["marketplaceId"],
      _count: { id: true },
    });

    const marketplaces = await prisma.marketplace.findMany();
    const marketplaceData = marketplaces.map((m) => {
      const count = marketplaceOrders.find((o) => o.marketplaceId === m.id)?._count.id || 0;
      return {
        name: m.shopName,
        type: m.type,
        jumlah: count,
        fill: m.type === "TOKOPEDIA" ? "#00A86B" : "#EE4D2D", // Tokopedia Green, Shopee Orange
      };
    });

    // Distribusi Status Pesanan
    const statusOrders = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusData = statusOrders.map((s) => ({
      name: s.status,
      value: s._count.id,
      fill:
        s.status === "NEW" ? "#3B82F6" :
        s.status === "PROCESSING" ? "#F59E0B" :
        s.status === "SHIPPED" ? "#8B5CF6" :
        s.status === "COMPLETED" ? "#10B981" : "#EF4444",
    }));

    // 10 Pesanan Terbaru
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { orderedAt: "desc" },
      include: {
        marketplace: { select: { type: true, shopName: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // 10 Log Sinkronisasi Terbaru
    const recentSyncLogs = await prisma.syncLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        marketplace: { select: { type: true, shopName: true } },
      },
    });

    // ======================
    // RENDER DASHBOARD
    // ======================
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Omnichannel Toko Karts
          </h1>
          <p className="text-gray-600 mt-2">
            Pengelolaan Pesanan Tokopedia & Shopee Terintegrasi dengan Stok Real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pesanan Baru (NEW)</p>
                <p className="text-2xl font-bold text-gray-800">{newOrders}</p>
                <p className="text-xs text-gray-500">Perlu segera diproses</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Stok Menipis (≤5)</p>
                <p className="text-2xl font-bold text-gray-800">{lowStockItems.length}</p>
                <p className="text-xs text-gray-500">Produk perlu restock</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Tingkat Sukses Sinkronisasi</p>
                <p className="text-2xl font-bold text-gray-800">{syncSuccessRate}%</p>
                <p className="text-xs text-gray-500">Dari {totalSyncs} proses sync</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts / Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Marketplace Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Pesanan per Marketplace</h2>
            <div className="space-y-4">
              {marketplaceData.map((m) => (
                <div key={m.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{m.name} ({m.type})</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full" style={{ width: `${totalOrders > 0 ? (m.jumlah / totalOrders) * 100 : 0}%`, backgroundColor: m.fill }}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{m.jumlah}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* 💡 Ganti dengan <MarketplaceChart data={marketplaceData} /> jika sudah ada komponen chart */}
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status Pesanan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statusData.map((s) => (
                <div key={s.name} className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600">{s.name}</p>
                  <p className="text-xl font-bold" style={{ color: s.fill }}>{s.value}</p>
                </div>
              ))}
            </div>
            {/* 💡 Ganti dengan <StatusChart data={statusData} /> jika sudah ada komponen chart */}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pesanan Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Marketplace</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketplace</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{order.marketplaceOrderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.marketplace.shopName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sync Logs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Log Sinkronisasi Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketplace</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSyncLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{log.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.marketplace?.shopName || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          log.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/orders" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Kelola Pesanan</h3>
                <p className="opacity-90 mt-1">Proses & update status pesanan</p>
              </div>
            </div>
          </Link>

          <Link href="/products" className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Manajemen Stok</h3>
                <p className="opacity-90 mt-1">Atur stok & mapping SKU</p>
              </div>
            </div>
          </Link>

          <Link href="/sync" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Sinkronisasi</h3>
                <p className="opacity-90 mt-1">Trigger sync & lihat log</p>
              </div>
            </div>
          </Link>

          <Link href="/settings" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-white/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">Pengaturan API</h3>
                <p className="opacity-90 mt-1">Konfigurasi Tokopedia & Shopee</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Konsistensi Stok & Sync */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📦 Info Sistem Omnichannel</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Total Pesanan Terintegrasi: <strong>{totalOrders}</strong></p>
            <p>• Pesanan Menunggu Proses: <strong>{newOrders}</strong></p>
            <p>• Produk Stok Rendah (≤5): <strong>{lowStockItems.length}</strong></p>
            <p>• Sinkronisasi Berhasil: <strong>{syncSuccessRate}%</strong> ({successSyncs}/{totalSyncs})</p>
            <p className="text-xs mt-2">Catatan: Stok otomatis berkurang saat status berubah ke PROCESSING/SHIPPED. Sync log mencatat semua aktivitas API marketplace.</p>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("❌ Error loading dashboard:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Omnichannel Toko Karts</h1>
          <p className="text-gray-600 mt-2">Pengelolaan Pesanan Tokopedia & Shopee Terintegrasi</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-red-700">{error.message || "Terjadi kesalahan pada server."}</p>
          <p className="text-red-600 mt-2">Silakan refresh halaman atau periksa koneksi database.</p>
        </div>
      </div>
    );
  }
}