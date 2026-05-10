import { prisma } from "@/lib/prisma";
import SettingsManager from "@/components/settings-manager";

export default async function SettingsPage() {
  try {
    const marketplaces = await prisma.marketplace.findMany({
      orderBy: { type: "asc" }
    });

    const serialized = JSON.parse(JSON.stringify(marketplaces));
    return <SettingsManager initialMarketplaces={serialized} />;
  } catch (error) {
    console.error("❌ Gagal memuat pengaturan API:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Pengaturan</h1>
        <p className="text-gray-600 mt-2">Terjadi kesalahan saat mengambil konfigurasi. Silakan refresh halaman.</p>
      </div>
    );
  }
}   