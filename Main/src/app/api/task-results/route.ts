// app/api/task-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Simpan hasil task dari usability testing (dengan upsert)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    if (!body.respondenId || !body.taskId) {
      return NextResponse.json(
        { success: false, error: "respondenId dan taskId diperlukan" },
        { status: 400 }
      );
    }

    const respondenIdNum = parseInt(body.respondenId);
    const taskIdNum = parseInt(body.taskId);

    if (isNaN(respondenIdNum) || isNaN(taskIdNum)) {
      return NextResponse.json(
        { success: false, error: "respondenId dan taskId harus berupa angka" },
        { status: 400 }
      );
    }

    // Gunakan upsert untuk menghindari duplicate key error
    const taskResult = await prisma.taskResult.upsert({
      where: {
        respondenId_taskId: {
          respondenId: respondenIdNum,
          taskId: taskIdNum
        }
      },
      update: {
        success: body.success ?? true,
        timeOnTask: body.timeOnTask ?? 0,
        errorCount: body.errorCount ?? 0,
        // updatedAt akan otomatis terisi jika ada field updatedAt, atau kita bisa biarkan
      },
      create: {
        respondenId: respondenIdNum,
        taskId: taskIdNum,
        success: body.success ?? true,
        timeOnTask: body.timeOnTask ?? 0,
        errorCount: body.errorCount ?? 0
      },
      include: {
        responden: true,
        task: true
      }
    });

    return NextResponse.json({
      success: true,
      data: taskResult,
      message: "Hasil task berhasil disimpan"
    });
  } catch (error) {
    console.error("Error saving task result:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Gagal menyimpan hasil task",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET: Ambil task results (tidak berubah)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const respondenId = searchParams.get("respondenId");
    const taskId = searchParams.get("taskId");

    const whereClause: any = {};
    if (respondenId) whereClause.respondenId = parseInt(respondenId);
    if (taskId) whereClause.taskId = parseInt(taskId);

    const taskResults = await prisma.taskResult.findMany({
      where: whereClause,
      include: {
        responden: true,
        task: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: taskResults,
      count: taskResults.length
    });
  } catch (error) {
    console.error("Error fetching task results:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data task results" },
      { status: 500 }
    );
  }
}