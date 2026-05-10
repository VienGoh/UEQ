// app/api/responden/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil detail responden
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const responden = await prisma.responden.findUnique({
      where: { id: parseInt(id) },
      include: {
        platform: true,
        taskResults: {
          include: {
            task: true
          }
        },
        susAnswers: {
          include: {
            question: true
          }
        },
        ueqAnswers: { // Tambahkan jika ingin include ueqAnswers
          include: {
            question: true
          }
        }
      }
    });

    if (!responden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: responden
    });
  } catch (error) {
    console.error("Error fetching respondent:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data responden" },
      { status: 500 }
    );
  }
}

// PUT: Update responden
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (!body.nama || !body.platformId) {
      return NextResponse.json(
        { success: false, error: "Data yang diperlukan tidak lengkap" },
        { status: 400 }
      );
    }

    const existingResponden = await prisma.responden.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingResponden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedResponden = await prisma.responden.update({
      where: { id: parseInt(id) },
      data: {
        nama: body.nama,
        umur: body.umur ? parseInt(body.umur) : undefined,
        jenisKelamin: body.jenisKelamin || undefined,
        platformId: parseInt(body.platformId)
      },
      include: {
        platform: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedResponden,
      message: "Responden berhasil diperbarui"
    });
  } catch (error: any) {
    console.error("Error updating respondent:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui responden" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus responden
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const respondenId = parseInt(id);
    
    const existingResponden = await prisma.responden.findUnique({
      where: { id: respondenId }
    });

    if (!existingResponden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus semua data terkait (child records) secara berurutan
    // 1. Hapus UEQAnswer (model UEQAnswer -> camelCase: uEQAnswer)
    await prisma.uEQAnswer.deleteMany({
      where: { respondenId: respondenId }
    });

    // 2. Hapus SUSAnswer (model SUSAnswer -> camelCase: sUSAnswer)
    await prisma.sUSAnswer.deleteMany({
      where: { respondenId: respondenId }
    });

    // 3. Hapus TaskResult (model TaskResult -> camelCase: taskResult)
    await prisma.taskResult.deleteMany({
      where: { respondenId: respondenId }
    });

    // 4. Hapus responden
    await prisma.responden.delete({
      where: { id: respondenId }
    });

    return NextResponse.json({
      success: true,
      message: "Responden berhasil dihapus"
    });
  } catch (error: any) {
    console.error("Error deleting respondent:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Tangani foreign key constraint error (P2003) jika masih ada child yang tidak terhapus
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Tidak dapat menghapus responden karena masih ada data terkait (jawaban UEQ, SUS, atau task result)",
          details: error.meta?.field_name || "Foreign key constraint"
        },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Gagal menghapus responden",
        details: error.message 
      },
      { status: 500 }
    );
  }
}