// prisma/seed.cjs - VERSI FINAL DENGAN SUS & UEQ
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

(async function main() {
  try {
    console.log("🧹 Clearing database...");

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

    // ======================
    // SUS QUESTIONS (sesuai daftar baru)
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
    // UEQ QUESTIONS (25 items sesuai daftar)
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

    await prisma.uEQQuestion.createMany({
      data: ueqItems,
    });

    const ueqQuestions = await prisma.uEQQuestion.findMany();

    // ======================
    // RESPONDEN (60 TOTAL: 30 Shopee + 30 TikTok Shop)
    // ======================
    const platforms = [shopee, tiktok];
    let totalResponden = 0;
    let totalTaskResults = 0;
    const allRespondents = [];

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

        allRespondents.push(responden);

        // ---- Task Result untuk TASK REGULAR (5 task pertama) ----
        console.log(`    Creating regular task results...`);
        for (let j = 0; j < 5; j++) {
          const task = tasks[j];
          if (!task) continue;
          
          await prisma.taskResult.create({
            data: {
              respondenId: responden.id,
              taskId: task.id,
              success: Math.random() > 0.15,
              timeOnTask: rand(30, 240),
              errorCount: Math.random() > 0.15 ? rand(0, 2) : rand(2, 5),
              createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000)
            },
          });
          totalTaskResults++;
        }

        // ---- SUS Answers ----
        console.log(`    Creating SUS answers...`);
        for (const q of susQuestions) {
          await prisma.sUSAnswer.create({
            data: {
              respondenId: responden.id,
              questionId: q.id,
              score: q.isPositive ? rand(3, 5) : rand(1, 3)
            },
          });
        }

        // ---- UEQ Answers ----
        console.log(`    Creating UEQ answers...`);
        for (const q of ueqQuestions) {
          // Skala -3 sampai +3
          const score = rand(-3, 3);
          await prisma.uEQAnswer.create({
            data: {
              respondenId: responden.id,
              questionId: q.id,
              score: score
            },
          });
        }
      }
      
      console.log(`  ✅ Created 30 respondents for ${platform.name}`);
    }

    // ======================
    // BUAT TASK RESULT UNTUK "PROSES BELANJA ONLINE"
    // ======================
    console.log("\n🛒 Creating shopping task results...");
    
    const respondentsForShopping = [];
    for (let i = 0; i < 40; i++) {
      const randomIndex = Math.floor(Math.random() * allRespondents.length);
      if (!respondentsForShopping.includes(allRespondents[randomIndex].id)) {
        respondentsForShopping.push(allRespondents[randomIndex].id);
      }
    }
    
    console.log(`Selected ${respondentsForShopping.length} respondents for shopping task`);
    
    for (const respondentId of respondentsForShopping) {
      if (belanjaTask) {
        await prisma.taskResult.create({
          data: {
            respondenId: respondentId,
            taskId: belanjaTask.id,
            success: Math.random() > 0.25,
            timeOnTask: rand(60, 300),
            errorCount: rand(0, 3),
            createdAt: new Date(Date.now() - rand(0, 7) * 24 * 60 * 60 * 1000)
          },
        });
        totalTaskResults++;
      }
    }

    // ======================
    // BUAT DATA UNTUK MONITORING PAGE
    // ======================
    console.log("\n📊 Creating data for monitoring page...");
    
    const respondentsWithoutBelanja = allRespondents.filter(r => 
      !respondentsForShopping.includes(r.id)
    ).slice(0, 5);
    
    console.log(`Found ${respondentsWithoutBelanja.length} respondents without shopping task`);
    
    for (const respondent of respondentsWithoutBelanja) {
      if (belanjaTask) {
        await prisma.taskResult.create({
          data: {
            respondenId: respondent.id,
            taskId: belanjaTask.id,
            success: Math.random() > 0.3,
            timeOnTask: rand(45, 120),
            errorCount: rand(0, 2),
            createdAt: new Date(Date.now() - rand(1, 10) * 60 * 1000)
          },
        });
        totalTaskResults++;
        console.log(`  Created RECENT shopping session for ${respondent.nama}`);
      }
    }

    // ======================
    // BUAT DATA UNTUK DEMO SESSION YANG BERBEDA STATUS
    // ======================
    console.log("\n🎭 Creating demo sessions with different statuses...");
    
    const demoRespondents = allRespondents.slice(0, 3);
    const statuses = [true, false, true];
    
    for (let i = 0; i < demoRespondents.length; i++) {
      const respondent = demoRespondents[i];
      if (belanjaTask) {
        const existing = await prisma.taskResult.findFirst({
          where: {
            respondenId: respondent.id,
            taskId: belanjaTask.id
          }
        });
        
        if (!existing) {
          await prisma.taskResult.create({
            data: {
              respondenId: respondent.id,
              taskId: belanjaTask.id,
              success: statuses[i],
              timeOnTask: i === 1 ? rand(180, 300) : rand(60, 120),
              errorCount: i === 1 ? rand(3, 5) : rand(0, 1),
              createdAt: new Date(Date.now() - rand(0, 30) * 60 * 1000)
            },
          });
          totalTaskResults++;
          const statusText = statuses[i] ? "✅ Success" : "❌ Failed";
          console.log(`  Created demo session for ${respondent.nama}: ${statusText}`);
        }
      }
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
    
    // Hitung statistik shopping task
    if (belanjaTask) {
      const shoppingResults = await prisma.taskResult.findMany({
        where: { taskId: belanjaTask.id },
        include: {
          responden: {
            include: { platform: true }
          }
        }
      });
      
      if (shoppingResults.length > 0) {
        const successCount = shoppingResults.filter(tr => tr.success === true).length;
        const failedCount = shoppingResults.filter(tr => tr.success === false).length;
        const totalCompleted = successCount + failedCount;
        
        const shopeeResults = shoppingResults.filter(sr => sr.responden.platform.name === "Shopee");
        const tiktokResults = shoppingResults.filter(sr => sr.responden.platform.name === "TikTok Shop");
        
        console.log("\n🎯 Shopping Task Statistics:");
        console.log("-".repeat(40));
        console.log(`• Total Sessions: ${shoppingResults.length}`);
        console.log(`• Success: ${successCount}`);
        console.log(`• Failed: ${failedCount}`);
        console.log(`• Success Rate: ${totalCompleted > 0 ? Math.round((successCount / totalCompleted) * 100) : 0}%`);
        console.log(`• Shopee Sessions: ${shopeeResults.length}`);
        console.log(`• TikTok Shop Sessions: ${tiktokResults.length}`);
      }
    }
    
    // Tampilkan sample data
    console.log("\n👥 Sample Data Created:");
    console.log("-".repeat(40));
    
    const sampleData = await prisma.responden.findMany({
      take: 3,
      include: {
        platform: true,
        taskResults: {
          take: 3,
          include: { task: true }
        }
      }
    });
    
    sampleData.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.nama} (${r.platform.name})`);
      console.log(`   Age: ${r.umur}, Gender: ${r.jenisKelamin}`);
      console.log(`   Tasks completed: ${r.taskResults.length}`);
      r.taskResults.forEach((tr, i) => {
        const status = tr.success ? '✅ Success' : '❌ Failed';
        const timeAgo = Math.round((Date.now() - new Date(tr.createdAt).getTime()) / (1000 * 60));
        console.log(`   - ${tr.task.namaTask}: ${status} (${tr.timeOnTask}s, ${timeAgo}m ago)`);
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
    
    // Login info
    console.log("\n🔐 Login Credentials:");
    console.log("-".repeat(40));
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\n💡 Tip: Use ID 1-60 for testing page: /testing?id=[1-60]");
    
    console.log("\n" + "🚀".repeat(20));
    console.log("✅ SEED BERHASIL DIEKSEKUSI!");
    console.log("🚀".repeat(20));
    
  } catch (error) {
    console.error("❌ ERROR SEED:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();