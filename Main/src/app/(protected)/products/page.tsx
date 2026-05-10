import { prisma } from "@/lib/prisma";
import ProductsManager from "@/components/products-manager";

export default async function ProductsPage() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stock: true,
        marketplaceProducts: {
          include: { marketplace: { select: { id: true, type: true, shopName: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const marketplaces = await prisma.marketplace.findMany({
      select: { id: true, type: true, shopName: true }
    });

    // Serialize agar Date & Decimal aman di Client Component
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedMarketplaces = JSON.parse(JSON.stringify(marketplaces));

    return <ProductsManager initialProducts={serializedProducts} marketplaces={serializedMarketplaces} />;
  } catch (error) {
    console.error("❌ Gagal memuat data produk:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Produk</h1>
        <p className="text-gray-600 mt-2">Terjadi kesalahan saat mengambil data. Silakan refresh halaman.</p>
      </div>
    );
  }
}