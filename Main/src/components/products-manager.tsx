"use client";

import { useState, useMemo } from "react";

type Marketplace = { id: number; type: "TOKOPEDIA" | "SHOPEE"; shopName: string };
type MarketplaceProduct = {
  id: number;
  marketplaceItemId: string;
  marketplaceSku?: string;
  marketplace: Marketplace;
};
type Stock = { id: number; quantity: number; reserved: number };
type Product = {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: string;
  isActive: boolean;
  stock?: Stock;
  marketplaceProducts: MarketplaceProduct[];
};

export default function ProductsManager({
  initialProducts,
  marketplaces
}: {
  initialProducts: Product[];
  marketplaces: Marketplace[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    quantity: 0,
    tokopediaItemId: "",
    shopeeItemId: ""
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    const tokopediaMap = product.marketplaceProducts.find(mp => mp.marketplace.type === "TOKOPEDIA");
    const shopeeMap = product.marketplaceProducts.find(mp => mp.marketplace.type === "SHOPEE");
    setFormData({
      quantity: product.stock?.quantity || 0,
      tokopediaItemId: tokopediaMap?.marketplaceItemId || "",
      shopeeItemId: shopeeMap?.marketplaceItemId || ""
    });
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setLoading(String(selectedProduct.id));
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Gagal memperbarui produk");

      // Optimistic UI Update
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? {
        ...p,
        stock: { ...(p.stock || { id: 0, reserved: 0 }), quantity: formData.quantity },
        marketplaceProducts: [
          ...(p.marketplaceProducts.filter(mp => mp.marketplace.type !== "TOKOPEDIA" && mp.marketplace.type !== "SHOPEE")),
          ...(formData.tokopediaItemId ? [{ id: 0, marketplaceItemId: formData.tokopediaItemId, marketplace: marketplaces.find(m => m.type === "TOKOPEDIA")! }] : []),
          ...(formData.shopeeItemId ? [{ id: 0, marketplaceItemId: formData.shopeeItemId, marketplace: marketplaces.find(m => m.type === "SHOPEE")! }] : [])
        ]
      } : p));

      alert("✅ Stok & mapping berhasil diperbarui.");
      setSelectedProduct(null);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const getAvailableStock = (stock?: Stock) => {
    if (!stock) return 0;
    return Math.max(0, stock.quantity - stock.reserved);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Produk & Stok</h1>
        <p className="text-gray-600 mt-2">Kelola katalog produk, stok fisik, reserved, dan mapping SKU marketplace</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="🔍 Cari SKU atau Nama Produk..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Fisik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tersedia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mapping Marketplace</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Tidak ada produk ditemukan</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const available = getAvailableStock(product.stock);
                  const isLowStock = available <= 5;
                  const tokopediaMap = product.marketplaceProducts.find(mp => mp.marketplace.type === "TOKOPEDIA");
                  const shopeeMap = product.marketplaceProducts.find(mp => mp.marketplace.type === "SHOPEE");

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Rp {Number(product.price).toLocaleString("id-ID")}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.stock?.quantity || 0}</td>
                      <td className="px-6 py-4 text-sm text-yellow-600">{product.stock?.reserved || 0}</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        <span className={isLowStock ? "text-red-600" : "text-green-600"}>
                          {available} {isLowStock && "⚠️"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 space-y-1">
                        {tokopediaMap ? <div className="bg-green-50 px-2 py-1 rounded">🟢 Tokopedia: {tokopediaMap.marketplaceItemId}</div> : <div className="bg-gray-100 px-2 py-1 rounded">⚪ Tokopedia: Belum</div>}
                        {shopeeMap ? <div className="bg-orange-50 px-2 py-1 rounded">🟠 Shopee: {shopeeMap.marketplaceItemId}</div> : <div className="bg-gray-100 px-2 py-1 rounded">⚪ Shopee: Belum</div>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                        >
                          Edit Stok & Mapping
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            <h2 className="text-xl font-bold mb-4">Edit Produk: {selectedProduct.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Fisik</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500 mt-1">Reserved: {selectedProduct.stock?.reserved || 0} (otomatis dari pesanan NEW/PROCESSING)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tokopedia Item ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.tokopediaItemId}
                  onChange={(e) => setFormData({ ...formData, tokopediaItemId: e.target.value })}
                  placeholder="Contoh: 123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shopee Item ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.shopeeItemId}
                  onChange={(e) => setFormData({ ...formData, shopeeItemId: e.target.value })}
                  placeholder="Contoh: 987654321"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={loading === String(selectedProduct.id)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading === String(selectedProduct.id) ? "Menyimpan..." : "Simpan & Sinkronkan"}
                </button>
                <button onClick={() => setSelectedProduct(null)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}