import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua responden dengan filter (platform & search)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get("platformId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    if (platformId) {
      whereClause.platformId = parseInt(platformId);
    }
    
    if (search && search.trim() !== "") {
      whereClause.nama = {
        contains: search,
      };
    }

    const [responden, total] = await Promise.all([
      prisma.responden.findMany({
        where: whereClause,
        include: {
          platform: true,
          taskResults: {
            include: {
              task: true
            }
          },
          susAnswers: true,
          ueqAnswers: true,
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.responden.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: responden,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching respondents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch respondents" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi input
    if (!body.nama || !body.umur || !body.jenisKelamin || !body.platformId) {
      return NextResponse.json(
        { error: "Semua field (nama, umur, jenisKelamin, platformId) harus diisi" },
        { status: 400 }
      );
    }

    const platformIdNum = parseInt(body.platformId);
    if (isNaN(platformIdNum)) {
      return NextResponse.json(
        { error: "platformId harus berupa angka" },
        { status: 400 }
      );
    }

    // Cek apakah platform ada
    const platformExists = await prisma.platform.findUnique({
      where: { id: platformIdNum },
    });

    if (!platformExists) {
      return NextResponse.json(
        { error: `Platform dengan id ${platformIdNum} tidak ditemukan. Jalankan seed terlebih dahulu.` },
        { status: 400 }
      );
    }

    // Simpan responden
    const newResponden = await prisma.responden.create({
      data: {
        nama: body.nama,
        umur: parseInt(body.umur),
        jenisKelamin: body.jenisKelamin,
        platformId: platformIdNum,
      },
    });

    return NextResponse.json({ id: newResponden.id });
  } catch (error) {
    console.error("Error creating respondent:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan responden" },
      { status: 500 }
    );
  }
}

// GET, PUT, DELETE (sama seperti kode sebelumnya, tidak perlu diubah)