import { prisma } from "@/lib/prisma";
import OrdersManager from "@/components/orders-manager";

export default async function OrdersPage() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        marketplace: { select: { type: true, shopName: true } },
        items: { include: { product: { select: { sku: true, name: true, price: true } } } },
      },
      orderBy: { orderedAt: "desc" },
    });

    // Serialize Date & Decimal agar aman di Client Component
    const serializedOrders = JSON.parse(JSON.stringify(orders));
    return <OrdersManager initialOrders={serializedOrders} />;
  } catch (error) {
    console.error("❌ Gagal memuat data pesanan:", error);
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Gagal Memuat Pesanan</h1>
        <p className="text-gray-600 mt-2">Terjadi kesalahan saat mengambil data dari database. Silakan refresh atau periksa koneksi.</p>
      </div>
    );
  }
}