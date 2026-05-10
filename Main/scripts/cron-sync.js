// cron-sync.js
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📥 Simulasi Polling Pesanan Baru dari Marketplace
async function pullNewOrders() {
  console.log("🔄 [CRON] Memulai polling pesanan baru...");
  try {
    const marketplaces = await prisma.marketplace.findMany({ where: { isActive: true } });
    if (marketplaces.length === 0) return console.log("⚠️ Tidak ada marketplace aktif.");

    const mp = marketplaces[Math.floor(Math.random() * marketplaces.length)];
    const products = await prisma.product.findMany({ where: { isActive: true }, take: 3 });
    if (products.length === 0) return;

    const prod = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const total = Number(prod.price) * qty;

    await prisma.order.create({
      data: {
        marketplaceId: mp.id,
        marketplaceOrderId: `${mp.type}-CRON-${Date.now()}`,
        customerName: "Customer Auto-Pull",
        address: "Jl. Cron Job No. 1, Medan",
        status: "NEW",
        totalAmount: total,
        orderedAt: new Date(),
        items: { create: { productId: prod.id, quantity: qty, price: Number(prod.price) } }
      }
    });

    await prisma.syncLog.create({
      data: { marketplaceId: mp.id, type: "ORDER_PULL", status: "SUCCESS", message: "Polling cron berhasil", createdAt: new Date() }
    });
    console.log(`✅ [CRON] Pesanan baru dari ${mp.type} berhasil ditarik.`);
  } catch (err) {
    console.error("❌ [CRON] Gagal polling:", err.message);
    await prisma.syncLog.create({
      data: { type: "ORDER_PULL", status: "FAILED", message: err.message, createdAt: new Date() }
    });
  }
}

// 📦 Simulasi Push Stok ke Marketplace
async function pushStockSync() {
  console.log("📦 [CRON] Memulai sinkronisasi stok...");
  try {
    const stocks = await prisma.stock.findMany({ include: { product: true } });
    // 🔗 TODO: Ganti dengan fetch() ke PUT /stock API Tokopedia & Shopee
    await prisma.syncLog.create({
      data: {
        type: "STOCK_PUSH",
        status: "SUCCESS",
        message: `Sync ${stocks.length} produk berhasil`,
        payload: JSON.stringify(stocks.map(s => ({ sku: s.product.sku, qty: s.quantity }))),
        createdAt: new Date()
      }
    });
    console.log("✅ [CRON] Sinkronisasi stok selesai.");
  } catch (err) {
    console.error("❌ [CRON] Gagal sync stok:", err.message);
  }
}

// ⏰ Jadwal: Setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  console.log("\n⏰ [CRON] Trigger otomatis berjalan...");
  await pullNewOrders();
  await pushStockSync();
});

console.log("🚀 Cron Job Omnichannel aktif. Berjalan setiap 5 menit. Tekan Ctrl+C untuk berhenti.");
// Jalankan sekali saat pertama start
pullNewOrders();
pushStockSync();