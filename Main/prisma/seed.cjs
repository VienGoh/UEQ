// prisma/seed.cjs - VERSI LENGKAP DENGAN MODE: 1 = FULL RESET, 2 = TAMBAH TASK KE-6 (DEFAULT)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ====================== PILIH MODE DI SINI ======================
const MODE = 2;   // 1 = Full Reset (hapus semua & generate ulang), 2 = Tambah task ke-6 untuk yang masih 5 task
// =================================================================

// helper
const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Nama-nama khas Indonesia
const namaDepan = [
  "Ahmad", "Muhammad", "Abdul", "Ali", "Budi", "Dewi", "Sari", "Putri",
  "Siti", "Rahmat", "Joko", "Sri", "Rini", "Ayu", "Dian", "Eka",
  "Fajar", "Gita", "Hadi", "Indah", "Johan", "Kartika", "Lestari", "Mega",
  "Nina", "Oki", "Putra", "Rama", "Sinta", "Tono", "Umi", "Wawan", "Yuni", "Zaki"
];

const namaBelakang = [
  "Santoso", "Wijaya", "Saputra", "Hidayat", "Setiawan", "Pratama", "Nugroho",
  "Kurniawan", "Susanto", "Purnomo", "Ramadhani", "Firmansyah", "Maulana",
  "Irawan", "Gunawan", "Hartono", "Kusuma", "Siregar", "Simanjuntak", "Nasution",
  "Sihombing", "Sinaga", "Manalu", "Sitorus", "Purba", "Siregar", "Panggabean",
  "Hutagalung", "Situmorang", "Lumban Tobing", "Lumban Gaol", "Marpaung",
  "Samosir", "Pakpahan", "Ginting", "Tarigan", "Sembiring", "Barus", "Perangin-angin"
];

const generateNamaIndonesia = () => {
  const punyaBelakang = Math.random() < 0.8;
  if (punyaBelakang) {
    return `${pick(namaDepan)} ${pick(namaBelakang)}`;
  } else {
    return `${pick(namaDepan)}`;
  }
};

// ====================== FUNGSI FULL RESET ======================
async function fullReset() {
  console.log("🧹 FULL RESET: Menghapus semua data...");

  // ======================
  // CLEAR DATA (termasuk UEQ)
  // ======================
  await prisma.uEQAnswer.deleteMany();
  await prisma.uEQQuestion.deleteMany();
  await prisma.sUSAnswer.deleteMany();
  await prisma.taskResult.deleteMany();
  await prisma.responden.deleteMany();
  await prisma.sUSQuestion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.admin.deleteMany();

  // ======================
  // PLATFORM
  // ======================
  console.log("📱 Creating platforms...");
  const shopee = await prisma.platform.create({
    data: { name: "Shopee" },
  });
  const tiktok = await prisma.platform.create({
    data: { name: "TikTok Shop" },
  });

  // ======================
  // ADMIN
  // ======================
  console.log("👤 Creating admin...");
  await prisma.admin.create({
    data: {
      username: "admin",
      password: "admin123"
    },
  });

  // ======================
  // TASK
  // ======================
  console.log("📋 Creating tasks...");
  await prisma.task.createMany({
    data: [
      {
        namaTask: "Mencari produk",
        deskripsi: "Pengguna diminta mencari produk tertentu menggunakan fitur pencarian."
      },
      {
        namaTask: "Melihat detail produk",
        deskripsi: "Pengguna membuka halaman detail produk untuk melihat harga, deskripsi, dan ulasan."
      },
      {
        namaTask: "Menambahkan ke keranjang",
        deskripsi: "Pengguna menambahkan produk yang dipilih ke dalam keranjang belanja."
      },
      {
        namaTask: "Melakukan checkout",
        deskripsi: "Pengguna melakukan proses checkout hingga tahap konfirmasi pesanan."
      },
      {
        namaTask: "Melacak pesanan",
        deskripsi: "Pengguna melihat status dan informasi pengiriman pesanan."
      },
      {
        namaTask: "Proses Belanja Online",
        deskripsi: "Simulasi proses belanja dari pencarian hingga checkout"
      },
    ],
  });

  const tasks = await prisma.task.findMany();
  const belanjaTask = tasks.find(t => t.namaTask === "Proses Belanja Online");
  if (!belanjaTask) throw new Error("Task 'Proses Belanja Online' tidak ditemukan!");

  // ======================
  // SUS QUESTIONS (10 items)
  // ======================
  console.log("❓ Creating SUS questions (10 items)...");
  await prisma.sUSQuestion.createMany({
    data: [
      { question: "Saya merasa sistem e-commerce ini mudah digunakan.", isPositive: true },
      { question: "Saya dapat menyelesaikan tugas dengan mudah menggunakan sistem ini.", isPositive: true },
      { question: "Saya merasa sistem ini terlalu kompleks untuk digunakan.", isPositive: false },
      { question: "Navigasi dalam sistem terasa membingungkan.", isPositive: false },
      { question: "Fitur-fitur dalam sistem terintegrasi dengan baik.", isPositive: true },
      { question: "Terdapat ketidakkonsistenan pada tampilan atau fungsi sistem.", isPositive: false },
      { question: "Sistem ini mudah dipelajari oleh pengguna baru.", isPositive: true },
      { question: "Saya membutuhkan waktu lama untuk memahami cara penggunaan sistem.", isPositive: false },
      { question: "Saya merasa percaya diri ketika menggunakan sistem ini.", isPositive: true },
      { question: "Saya memerlukan bantuan teknis untuk menggunakan sistem secara optimal.", isPositive: false },
    ],
  });
  const susQuestions = await prisma.sUSQuestion.findMany();

  // ======================
  // UEQ QUESTIONS (25 items)
  // ======================
  console.log("🎨 Creating UEQ questions (25 items)...");
  const ueqItems = [
    // Attractiveness (5)
    { category: "Attractiveness", leftAdjective: "Tidak menarik", rightAdjective: "Menarik" },
    { category: "Attractiveness", leftAdjective: "Tidak menyenangkan", rightAdjective: "Menyenangkan" },
    { category: "Attractiveness", leftAdjective: "Tidak disukai", rightAdjective: "Disukai" },
    { category: "Attractiveness", leftAdjective: "Buruk", rightAdjective: "Baik" },
    { category: "Attractiveness", leftAdjective: "Tidak nyaman", rightAdjective: "Nyaman" },
    // Perspicuity (4)
    { category: "Perspicuity", leftAdjective: "Membingungkan", rightAdjective: "Jelas" },
    { category: "Perspicuity", leftAdjective: "Sulit dipahami", rightAdjective: "Mudah dipahami" },
    { category: "Perspicuity", leftAdjective: "Sulit dipelajari", rightAdjective: "Mudah dipelajari" },
    { category: "Perspicuity", leftAdjective: "Tidak intuitif", rightAdjective: "Intuitif" },
    // Efficiency (4)
    { category: "Efficiency", leftAdjective: "Lambat", rightAdjective: "Cepat" },
    { category: "Efficiency", leftAdjective: "Tidak efisien", rightAdjective: "Efisien" },
    { category: "Efficiency", leftAdjective: "Rumit", rightAdjective: "Sederhana" },
    { category: "Efficiency", leftAdjective: "Tidak praktis", rightAdjective: "Praktis" },
    // Dependability (4)
    { category: "Dependability", leftAdjective: "Tidak dapat diprediksi", rightAdjective: "Dapat diprediksi" },
    { category: "Dependability", leftAdjective: "Tidak aman", rightAdjective: "Aman" },
    { category: "Dependability", leftAdjective: "Tidak konsisten", rightAdjective: "Konsisten" },
    { category: "Dependability", leftAdjective: "Tidak responsif", rightAdjective: "Responsif" },
    // Stimulation (4)
    { category: "Stimulation", leftAdjective: "Membosankan", rightAdjective: "Menarik" },
    { category: "Stimulation", leftAdjective: "Tidak memotivasi", rightAdjective: "Memotivasi" },
    { category: "Stimulation", leftAdjective: "Monoton", rightAdjective: "Menyenangkan" },
    { category: "Stimulation", leftAdjective: "Tidak kreatif", rightAdjective: "Kreatif" },
    // Novelty (4)
    { category: "Novelty", leftAdjective: "Kuno", rightAdjective: "Modern" },
    { category: "Novelty", leftAdjective: "Umum", rightAdjective: "Inovatif" },
    { category: "Novelty", leftAdjective: "Konvensional", rightAdjective: "Unik" },
    { category: "Novelty", leftAdjective: "Biasa saja", rightAdjective: "Berbeda" },
  ];
  await prisma.uEQQuestion.createMany({ data: ueqItems });
  const ueqQuestions = await prisma.uEQQuestion.findMany();

  // ======================
  // RESPONDEN (60 TOTAL: 30 Shopee + 30 TikTok Shop)
  // SETIAP RESPONDEN MENDAPAT 6 TASK (5 REGULER + 1 BELANJA) menggunakan createMany
  // ======================
  const platforms = [shopee, tiktok];
  let totalResponden = 0;
  let totalTaskResults = 0;

  for (const platform of platforms) {
    console.log(`\n📝 Generating respondents for ${platform.name}...`);
    for (let i = 1; i <= 30; i++) {
      totalResponden++;
      const nama = generateNamaIndonesia();
      console.log(`  Creating respondent ${totalResponden}: ${nama}`);

      const responden = await prisma.responden.create({
        data: {
          nama: nama,
          umur: rand(18, 40),
          jenisKelamin: pick(["Laki-laki", "Perempuan"]),
          platformId: platform.id,
          createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000)
        },
      });

      // --- Buat semua 6 taskResult sekaligus dengan createMany ---
      const taskResultsData = tasks.map(task => {
        const isBelanja = task.id === belanjaTask.id;
        return {
          respondenId: responden.id,
          taskId: task.id,
          success: isBelanja ? Math.random() > 0.25 : Math.random() > 0.15,
          timeOnTask: isBelanja ? rand(60, 300) : rand(30, 240),
          errorCount: isBelanja ? rand(0, 3) : (Math.random() > 0.15 ? rand(0, 2) : rand(2, 5)),
          createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000)
        };
      });
      await prisma.taskResult.createMany({ data: taskResultsData });
      totalTaskResults += taskResultsData.length;

      // --- SUS Answers ---
      console.log(`    Creating SUS answers...`);
      await prisma.sUSAnswer.createMany({
        data: susQuestions.map(q => ({
          respondenId: responden.id,
          questionId: q.id,
          score: q.isPositive ? rand(3, 5) : rand(1, 3)
        }))
      });

      // --- UEQ Answers ---
      console.log(`    Creating UEQ answers...`);
      await prisma.uEQAnswer.createMany({
        data: ueqQuestions.map(q => ({
          respondenId: responden.id,
          questionId: q.id,
          score: rand(-3, 3)
        }))
      });
    }
    console.log(`  ✅ Created 30 respondents for ${platform.name}`);
  }

  // ======================
  // STATISTICS & OUTPUT
  // ======================
  console.log("\n" + "=".repeat(50));
  console.log("📊 SEED STATISTICS:");
  console.log("=".repeat(50));
  console.log(`✅ Total Respondents: ${totalResponden}`);
  console.log(`✅ Total Platforms: ${platforms.length} (Shopee, TikTok Shop)`);
  console.log(`✅ Total Tasks: ${tasks.length}`);
  console.log(`✅ Total Task Results: ${totalTaskResults}`);
  console.log(`✅ Total SUS Questions: ${susQuestions.length}`);
  console.log(`✅ Total SUS Answers: ${totalResponden * susQuestions.length}`);
  console.log(`✅ Total UEQ Questions: ${ueqQuestions.length}`);
  console.log(`✅ Total UEQ Answers: ${totalResponden * ueqQuestions.length}`);
  console.log("=".repeat(50));

  // Hitung statistik per task (termasuk task ke-6)
  console.log("\n📈 Task Completion Statistics (per task):");
  console.log("-".repeat(40));
  for (const task of tasks) {
    const results = await prisma.taskResult.findMany({ where: { taskId: task.id } });
    const total = results.length;
    const success = results.filter(r => r.success === true).length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    console.log(`• ${task.namaTask}: ${success}/${total} (${successRate}%)`);
  }

  // Sample data
  console.log("\n👥 Sample Data Created:");
  console.log("-".repeat(40));
  const sampleData = await prisma.responden.findMany({
    take: 3,
    include: { platform: true, taskResults: { include: { task: true } } }
  });
  sampleData.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.nama} (${r.platform.name})`);
    console.log(`   Age: ${r.umur}, Gender: ${r.jenisKelamin}`);
    console.log(`   Total tasks completed: ${r.taskResults.length} (should be 6)`);
    r.taskResults.forEach((tr) => {
      const status = tr.success ? '✅ Success' : '❌ Failed';
      console.log(`   - ${tr.task.namaTask}: ${status} (${tr.timeOnTask}s)`);
    });
    console.log();
  });

  // Links
  console.log("🔗 Application Links:");
  console.log("-".repeat(40));
  console.log("• Dashboard: http://localhost:3000/dashboard");
  console.log("• Data Responden: http://localhost:3000/responden");
  console.log("• Monitoring: http://localhost:3000/testing/session");
  console.log("• Testing Page: http://localhost:3000/testing?id=1");
  console.log("• Analysis: http://localhost:3000/usability-testing");
  console.log("• Visualization: http://localhost:3000/visualisasi");
  console.log("\n🔐 Login Credentials:");
  console.log("-".repeat(40));
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("\n💡 Tip: Use ID 1-60 for testing page: /testing?id=[1-60]");
  console.log("\n" + "🚀".repeat(20));
  console.log("✅ SEED BERHASIL DIEKSEKUSI! SEMUA RESPONDEN MEMILIKI 6 TASK.");
  console.log("🚀".repeat(20));
}

// ====================== FUNGSI TAMBAH TASK KE-6 ======================
async function addMissingTask() {
  console.log("🔍 Mencari responden yang belum memiliki task 'Proses Belanja Online'...");

  const belanjaTask = await prisma.task.findFirst({
    where: { namaTask: "Proses Belanja Online" }
  });
  if (!belanjaTask) {
    console.error("❌ Task 'Proses Belanja Online' tidak ditemukan di database. Jalankan MODE 1 (full reset) terlebih dahulu.");
    return;
  }

  const allRespondents = await prisma.responden.findMany({
    include: {
      taskResults: {
        where: { taskId: belanjaTask.id }
      }
    }
  });

  const needAdd = allRespondents.filter(r => r.taskResults.length === 0);
  if (needAdd.length === 0) {
    console.log("✅ Semua responden sudah memiliki task 'Proses Belanja Online'.");
    return;
  }

  console.log(`📋 Ditemukan ${needAdd.length} responden yang belum memiliki task ke-6. Menambahkan...`);

  let added = 0;
  for (const responden of needAdd) {
    await prisma.taskResult.create({
      data: {
        respondenId: responden.id,
        taskId: belanjaTask.id,
        success: Math.random() > 0.25,
        timeOnTask: rand(60, 300),
        errorCount: rand(0, 3),
        createdAt: new Date(Date.now() - rand(0, 7) * 24 * 60 * 60 * 1000)
      }
    });
    added++;
    if (added % 10 === 0) console.log(`  ... sudah menambahkan ${added} responden`);
  }
  console.log(`✅ Berhasil menambahkan task ke-6 untuk ${added} responden.`);
}

// ====================== MAIN ======================
(async function main() {
  try {
    if (MODE === 1) {
      console.log("\n🚀 MENJALANKAN MODE 1: FULL RESET (hapus semua data dan generate ulang)\n");
      await fullReset();
    } else if (MODE === 2) {
      console.log("\n🚀 MENJALANKAN MODE 2: Tambah task ke-6 untuk responden yang masih 5 task (tanpa hapus data lain)\n");
      await addMissingTask();
    } else {
      console.error("MODE tidak dikenali. Gunakan 1 atau 2.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();