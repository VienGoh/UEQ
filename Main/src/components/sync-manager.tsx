"use client";

import { useState, useMemo } from "react";

type Marketplace = { id: number; type: "TOKOPEDIA" | "SHOPEE"; shopName: string; isActive: boolean };
type SyncLog = {
  id: number;
  type: "ORDER_PULL" | "STOCK_PUSH" | "STATUS_UPDATE";
  status: "SUCCESS" | "FAILED" | "PENDING";
  message?: string;
  payload?: string;
  createdAt: string;
  marketplace?: Marketplace;
  order?: { marketplaceOrderId: string };
};

export default function SyncManager({ initialLogs, marketplaces }: { initialLogs: SyncLog[]; marketplaces: Marketplace[] }) {
  const [logs, setLogs] = useState<SyncLog[]>(initialLogs);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterMarketplace, setFilterMarketplace] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchType = filterType === "ALL" || log.type === filterType;
      const matchStatus = filterStatus === "ALL" || log.status === filterStatus;
      const matchMarketplace = filterMarketplace === "ALL" || log.marketplace?.type === filterMarketplace;
      const matchSearch =
        log.message?.toLowerCase().includes(search.toLowerCase()) ||
        log.marketplace?.shopName.toLowerCase().includes(search.toLowerCase()) ||
        log.order?.marketplaceOrderId.toLowerCase().includes(search.toLowerCase());
      return matchType && matchStatus && matchMarketplace && matchSearch;
    });
  }, [logs, filterType, filterStatus, filterMarketplace, search]);

  const handleTriggerSync = async (type: "STOCK_PUSH" | "ORDER_PULL") => {
    const actionName = type === "STOCK_PUSH" ? "Sinkronisasi Stok" : "Tarik Pesanan Baru";
    if (!confirm(`Mulai ${actionName}? Proses akan berjalan di latar belakang.`)) return;
    setLoading(type);
    try {
      const res = await fetch("/api/sync/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (!res.ok) throw new Error("Gagal memicu sinkronisasi");
      const data = await res.json();
      alert(`✅ ${actionName} berhasil dipicu. Log ID: ${data.logId}`);
      window.location.reload();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleRetry = async (logId: number) => {
    if (!confirm("Coba ulang sinkronisasi yang gagal?")) return;
    setLoading(`retry-${logId}`);
    try {
      // Simulasi retry. Di produksi, panggil endpoint retry spesifik
      await new Promise(res => setTimeout(res, 800));
      setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: "PENDING", message: "Retry dijadwalkan ulang" } : l));
      alert("✅ Retry berhasil dijadwalkan");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      SUCCESS: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
  };

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = {
      ORDER_PULL: "bg-blue-100 text-blue-800",
      STOCK_PUSH: "bg-purple-100 text-purple-800",
      STATUS_UPDATE: "bg-orange-100 text-orange-800",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type] || "bg-gray-100 text-gray-800"}`}>{type.replace("_", " ")}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sinkronisasi & Log</h1>
        <p className="text-gray-600 mt-2">Pantau status sinkronisasi stok, pesanan, dan riwayat API marketplace</p>
      </div>

      {/* Trigger Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📦 Sinkronisasi Stok</h3>
          <p className="text-sm text-blue-700 mb-3">Kirim stok fisik terbaru ke Tokopedia & Shopee</p>
          <button onClick={() => handleTriggerSync("STOCK_PUSH")} disabled={loading === "STOCK_PUSH"} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading === "STOCK_PUSH" ? "Memproses..." : "Sync Stok Sekarang"}
          </button>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">📥 Tarik Pesanan Baru</h3>
          <p className="text-sm text-green-700 mb-3">Polling pesanan terbaru dari marketplace</p>
          <button onClick={() => handleTriggerSync("ORDER_PULL")} disabled={loading === "ORDER_PULL"} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
            {loading === "ORDER_PULL" ? "Memproses..." : "Pull Orders"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="🔍 Cari pesan log / ID pesanan..." className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="px-4 py-2 border rounded-lg bg-white" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="ALL">Semua Tipe</option>
          <option value="ORDER_PULL">Tarik Pesanan</option>
          <option value="STOCK_PUSH">Sync Stok</option>
          <option value="STATUS_UPDATE">Update Status</option>
        </select>
        <select className="px-4 py-2 border rounded-lg bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Semua Status</option>
          <option value="SUCCESS">Berhasil</option>
          <option value="FAILED">Gagal</option>
          <option value="PENDING">Menunggu</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Tidak ada log ditemukan</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4">{typeBadge(log.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{log.marketplace?.shopName || "-"}</td>
                    <td className="px-6 py-4">{statusBadge(log.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.message || "-"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setSelectedLog(log)} className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">Detail</button>
                      {log.status === "FAILED" && (
                        <button onClick={() => handleRetry(log.id)} disabled={loading === `retry-${log.id}`} className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg transition disabled:opacity-50">
                          {loading === `retry-${log.id}` ? "..." : "Retry"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-xl font-bold mb-4">Detail Log Sinkronisasi</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">ID Log:</span> {selectedLog.id}</p>
              <p><span className="font-medium">Tipe:</span> {typeBadge(selectedLog.type)}</p>
              <p><span className="font-medium">Status:</span> {statusBadge(selectedLog.status)}</p>
              <p><span className="font-medium">Marketplace:</span> {selectedLog.marketplace?.shopName || "-"}</p>
              <p><span className="font-medium">Waktu:</span> {new Date(selectedLog.createdAt).toLocaleString("id-ID")}</p>
              <p><span className="font-medium">Pesan:</span> {selectedLog.message || "-"}</p>
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold mb-2">Payload / Debug Data</h3>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {selectedLog.payload ? JSON.stringify(JSON.parse(selectedLog.payload), null, 2) : "Tidak ada payload"}
                </pre>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setSelectedLog(null)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}