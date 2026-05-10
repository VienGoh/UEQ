"use client";

import { useState } from "react";

type MarketplaceConfig = {
  id?: number;
  type: "TOKOPEDIA" | "SHOPEE";
  shopName: string;
  shopId: string;
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  isActive: boolean;
};

export default function SettingsManager({ initialMarketplaces }: { initialMarketplaces: MarketplaceConfig[] }) {
  const [configs, setConfigs] = useState<MarketplaceConfig[]>(initialMarketplaces);
  const [loading, setLoading] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const getConfig = (type: "TOKOPEDIA" | "SHOPEE") =>
    configs.find(c => c.type === type) || {
      type,
      shopName: "",
      shopId: "",
      apiKey: "",
      apiSecret: "",
      accessToken: "",
      refreshToken: "",
      isActive: true
    };

  const updateConfig = (type: "TOKOPEDIA" | "SHOPEE", field: keyof MarketplaceConfig, value: any) => {
    setConfigs(prev => {
      const idx = prev.findIndex(c => c.type === type);
      const updated = { ...getConfig(type), [field]: value };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  };

  const handleSave = async (type: "TOKOPEDIA" | "SHOPEE") => {
    const cfg = getConfig(type);
    if (!cfg.shopName || !cfg.shopId || !cfg.apiKey || !cfg.apiSecret) {
      alert("❌ Nama Toko, Shop ID, API Key, dan API Secret wajib diisi.");
      return;
    }

    setLoading(type);
    try {
      const res = await fetch("/api/settings/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg)
      });
      if (!res.ok) throw new Error("Gagal menyimpan konfigurasi");
      
      const saved = await res.json();
      setConfigs(prev => {
        const idx = prev.findIndex(c => c.type === type);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved.data;
          return copy;
        }
        return [...prev, saved.data];
      });
      alert(`✅ Konfigurasi ${type === "TOKOPEDIA" ? "Tokopedia" : "Shopee"} berhasil disimpan.`);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const toggleSecret = (type: string) => {
    setShowSecrets(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const renderForm = (type: "TOKOPEDIA" | "SHOPEE") => {
    const cfg = getConfig(type);
    const label = type === "TOKOPEDIA" ? "Tokopedia" : "Shopee";
    const color = type === "TOKOPEDIA" ? "green" : "orange";
    const isLoading = loading === type;

    return (
      <div className={`bg-white p-6 rounded-xl shadow-sm border border-${color}-200`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full bg-${color}-500`}></span>
            {label}
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">Aktif</span>
            <input
              type="checkbox"
              checked={cfg.isActive}
              onChange={(e) => updateConfig(type, "isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
            <input type="text" value={cfg.shopName} onChange={(e) => updateConfig(type, "shopName", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Toko Karts Official" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
            <input type="text" value={cfg.shopId} onChange={(e) => updateConfig(type, "shopId", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ID Toko dari Marketplace" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Client ID</label>
            <input type="text" value={cfg.apiKey} onChange={(e) => updateConfig(type, "apiKey", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Dari Developer Console" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Secret / Client Secret</label>
            <div className="relative">
              <input type={showSecrets[type] ? "text" : "password"} value={cfg.apiSecret} onChange={(e) => updateConfig(type, "apiSecret", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-10" placeholder="Rahasia" />
              <button type="button" onClick={() => toggleSecret(type)} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs">👁️</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (Opsional)</label>
            <input type="text" value={cfg.accessToken || ""} onChange={(e) => updateConfig(type, "accessToken", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Auto-generated via OAuth" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token (Opsional)</label>
            <input type="text" value={cfg.refreshToken || ""} onChange={(e) => updateConfig(type, "refreshToken", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Untuk perpanjangan token otomatis" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <button onClick={() => handleSave(type)} disabled={isLoading} className={`px-6 py-2 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition disabled:opacity-50`}>
            {isLoading ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan API Marketplace</h1>
        <p className="text-gray-600 mt-2">Konfigurasi koneksi Tokopedia & Shopee untuk sinkronisasi pesanan & stok otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderForm("TOKOPEDIA")}
        {renderForm("SHOPEE")}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">🔐 Catatan Keamanan & Integrasi</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>API Secret & Token disimpan terenkripsi di database (disarankan pakai env/var untuk produksi).</li>
          <li>Token akan diperbarui otomatis oleh sistem sebelum kedaluwarsa (refresh token flow).</li>
          <li>Pastikan Shop ID & API Key sesuai dengan yang terdaftar di Tokopedia Open Platform & Shopee Open Platform.</li>
          <li>Setelah menyimpan, sistem akan melakukan uji koneksi otomatis di latar belakang.</li>
        </ul>
      </div>
    </div>
  );
}