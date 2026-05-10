"use client";

import { useState, useMemo } from "react";
import { OrderStatus, MarketplaceType } from "@prisma/client";

type SerializedOrder = {
  id: number;
  marketplaceOrderId: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  status: OrderStatus;
  totalAmount: string;
  orderedAt: string;
  marketplace: { type: MarketplaceType; shopName: string };
  items: {
    id: number;
    quantity: number;
    price: string;
    product: { sku: string; name: string; price: string };
  }[];
};

export default function OrdersManager({ initialOrders }: { initialOrders: SerializedOrder[] }) {
  const [orders, setOrders] = useState<SerializedOrder[]>(initialOrders);
  const [filterMarketplace, setFilterMarketplace] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchMarketplace = filterMarketplace === "ALL" || o.marketplace.type === filterMarketplace;
      const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
      const matchSearch =
        o.marketplaceOrderId.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      return matchMarketplace && matchStatus && matchSearch;
    });
  }, [orders, filterMarketplace, filterStatus, search]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    if (!confirm(`Ubah status pesanan menjadi ${newStatus}? Stok akan otomatis disesuaikan.`)) return;
    setLoading(String(orderId));
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal update status");

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      alert("✅ Status & stok berhasil diperbarui");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      NEW: "bg-blue-100 text-blue-800",
      PROCESSING: "bg-yellow-100 text-yellow-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pesanan Masuk</h1>
        <p className="text-gray-600 mt-2">Kelola pesanan Tokopedia & Shopee dalam satu dashboard terpusat</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Cari ID Pesanan / Nama Customer..."
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg bg-white"
          value={filterMarketplace}
          onChange={(e) => setFilterMarketplace(e.target.value)}
        >
          <option value="ALL">Semua Marketplace</option>
          <option value="TOKOPEDIA">Tokopedia</option>
          <option value="SHOPEE">Shopee</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="NEW">Baru</option>
          <option value="PROCESSING">Diproses</option>
          <option value="SHIPPED">Dikirim</option>
          <option value="COMPLETED">Selesai</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Marketplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marketplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Tidak ada pesanan ditemukan</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{order.marketplaceOrderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.marketplace.shopName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-6 py-4">{statusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Rp {Number(order.totalAmount).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.orderedAt).toLocaleDateString("id-ID")}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">Detail</button>
                      {order.status === "NEW" && (
                        <button onClick={() => handleUpdateStatus(order.id, "PROCESSING")} disabled={loading === String(order.id)} className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50">
                          {loading === String(order.id) ? "..." : "Proses"}
                        </button>
                      )}
                      {order.status === "PROCESSING" && (
                        <button onClick={() => handleUpdateStatus(order.id, "SHIPPED")} disabled={loading === String(order.id)} className="px-3 py-1 text-xs bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition disabled:opacity-50">
                          {loading === String(order.id) ? "..." : "Kirim"}
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
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-bold mb-4">Detail Pesanan</h2>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">ID Marketplace:</span> {selectedOrder.marketplaceOrderId}</p>
              <p><span className="font-medium">Marketplace:</span> {selectedOrder.marketplace.shopName} ({selectedOrder.marketplace.type})</p>
              <p><span className="font-medium">Customer:</span> {selectedOrder.customerName} {selectedOrder.customerPhone && `(${selectedOrder.customerPhone})`}</p>
              <p><span className="font-medium">Alamat:</span> {selectedOrder.address}</p>
              <p><span className="font-medium">Status:</span> {statusBadge(selectedOrder.status)}</p>
              
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold mb-2">Item Pesanan</h3>
                <ul className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product.name} ({item.product.sku}) x{item.quantity}</span>
                      <span>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold mt-3 pt-2 border-t">
                  <span>Total</span>
                  <span>Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">🖨️ Cetak Resi</button>
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}