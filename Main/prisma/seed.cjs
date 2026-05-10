// prisma/seed.cjs - OMNICHANNEL TOKO KARTS
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randDate = (daysBack) => new Date(Date.now() - rand(0, daysBack) * 24 * 60 * 60 * 1000);

async function main() {
  console.log("🧹 Membersihkan data lama (FK Safe Order)...");
  await prisma.syncLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.marketplaceProduct.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketplace.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Membuat Admin Default...");
  // 🔐 Catatan: Untuk produksi, hash password dengan bcrypt sebelum simpan
  await prisma.user.create({
    data: { username: "admin", password: "admin123", fullName: "Admin Toko Karts", role: "ADMIN" }
  });

  console.log("🏪 Membuat Marketplace (Tokopedia & Shopee)...");
  const tokopedia = await prisma.marketplace.create({
    data: { type: "TOKOPEDIA", shopName: "Toko Karts Official", shopId: "TKPD_8821", apiKey: "dummy_tokped_key", apiSecret: "dummy_tokped_secret", isActive: true }
  });
  const shopee = await prisma.marketplace.create({
    data: { type: "SHOPEE", shopName: "Toko Karts Shopee", shopId: "SHPE_9934", apiKey: "dummy_shopee_key", apiSecret: "dummy_shopee_secret", isActive: true }
  });

  console.log("📦 Membuat Produk & Stok Fisik...");
  const productsData = [
    { sku: "KRT-001", name: "Kartu Remi Premium", price: 25000, desc: "Kartu remi kualitas turnamen" },
    { sku: "KRT-002", name: "Board Game Monopoly", price: 150000, desc: "Edisi klasik keluarga" },
    { sku: "KRT-003", name: "Puzzle 1000 Pcs", price: 85000, desc: "Landscape detail tinggi" },
    { sku: "KRT-004", name: "Dadu Akrilik Set", price: 35000, desc: "Set 6 dadu transparan" },
    { sku: "KRT-005", name: "Card Sleeve Matte", price: 45000, desc: "Pelindung kartu anti glare" },
    { sku: "KRT-006", name: "Meja Lipat Gaming", price: 350000, desc: "Portable & kokoh" },
    { sku: "KRT-007", name: "Timer Catur Digital", price: 120000, desc: "Presisi tinggi" },
    { sku: "KRT-008", name: "Playmat Custom", price: 95000, desc: "Alas bermain anti slip" },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: { sku: p.sku, name: p.name, description: p.desc, price: p.price, isActive: true }
    });
    createdProducts.push(product);
    await prisma.stock.create({
      data: { productId: product.id, quantity: rand(15, 120), reserved: 0 }
    });
  }

  console.log("🔗 Mapping Produk ke Marketplace...");
  for (const prod of createdProducts) {
    await prisma.marketplaceProduct.createMany({
      data: [
        { marketplaceId: tokopedia.id, productId: prod.id, marketplaceItemId: `TKPD_ITEM_${prod.id}` },
        { marketplaceId: shopee.id, productId: prod.id, marketplaceItemId: `SHPE_ITEM_${prod.id}` }
      ]
    });
  }

  console.log("📜 Generate Pesanan & Item...");
  const statuses = ["NEW", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
  const marketplaces = [tokopedia, shopee];
  const customers = ["Budi Santoso", "Siti Rahayu", "Andi Wijaya", "Dewi Lestari", "Rudi Hermawan", "Nina Karlina", "Joko Susilo", "Maya Indah"];
  const addresses = ["Jl. Merdeka No. 10, Medan", "Jl. Gatot Subroto No. 45, Jakarta", "Jl. Diponegoro No. 8, Surabaya", "Jl. Sudirman No. 22, Bandung"];

  let totalOrders = 0;
  let totalItems = 0;

  for (let i = 0; i < 25; i++) {
    const mp = pick(marketplaces);
    const status = pick(statuses);
    const orderDate = randDate(30);

    const numItems = rand(1, 3);
    const selected = [];
    const used = new Set();
    while (selected.length < numItems) {
      const idx = rand(0, createdProducts.length - 1);
      if (!used.has(idx)) { used.add(idx); selected.push(createdProducts[idx]); }
    }

    let orderTotal = 0;
    const itemsData = selected.map(prod => {
      const qty = rand(1, 3);
      const price = Number(prod.price);
      orderTotal += price * qty;
      return { productId: prod.id, quantity: qty, price };
    });

    await prisma.order.create({
      data: {
        marketplaceId: mp.id,
        marketplaceOrderId: `${mp.type === "TOKOPEDIA" ? "TKPD" : "SHPE"}-ORD-${String(i + 1).padStart(4, "0")}`,
        customerName: pick(customers),
        customerPhone: `08${rand(1111111111, 9999999999)}`,
        address: pick(addresses),
        status,
        totalAmount: orderTotal,
        orderedAt: orderDate,
        items: { create: itemsData }
      }
    });
    totalOrders++;
    totalItems += itemsData.length;
  }

  console.log("📊 Membuat Riwayat SyncLog...");
  const syncTypes = ["ORDER_PULL", "STOCK_PUSH", "STATUS_UPDATE"];
  const syncStatuses = ["SUCCESS", "FAILED", "PENDING"];
  const messages = ["Sinkronisasi berhasil", "Rate limit exceeded", "Token expired", "Menunggu antrian", "SKU tidak cocok"];
  
  for (let i = 0; i < 18; i++) {
    await prisma.syncLog.create({
      data: {
        marketplaceId: pick(marketplaces).id,
        type: pick(syncTypes),
        status: pick(syncStatuses),
        message: pick(messages),
        payload: JSON.stringify({ test: true, items: rand(1, 10) }),
        createdAt: randDate(7)
      }
    });
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 SEED STATISTICS:");
  console.log("=".repeat(50));
  console.log(`✅ Admin User: 1`);
  console.log(`✅ Marketplaces: 2 (Tokopedia, Shopee)`);
  console.log(`✅ Products: ${createdProducts.length}`);
  console.log(`✅ Orders: ${totalOrders}`);
  console.log(`✅ Order Items: ${totalItems}`);
  console.log(`✅ Sync Logs: 18`);
  console.log("=".repeat(50));
  console.log("\n🔐 Login Credentials:");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("\n🚀 SEED BERHASIL! SISTEM OMNICHANNEL SIAP DIGUNAKAN.");
}

main()
  .catch((e) => { console.error("❌ ERROR SEED:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });