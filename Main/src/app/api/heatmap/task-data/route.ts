import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await prisma.taskResult.findMany({
    include: {
      responden: {
        include: {
          platform: true,
        },
      },
      task: true,
    },
    orderBy: {
      respondenId: "asc",
    },
  });

  const groupedByResponden = new Map();

  for (const r of results) {
    if (!groupedByResponden.has(r.respondenId)) {
      groupedByResponden.set(r.respondenId, {
        respondenId: r.respondenId,
        respondenNama: r.responden.nama,
        platformName: r.responden.platform.name,
        tasks: [],
      });
    }
    const entry = groupedByResponden.get(r.respondenId);
    entry.tasks.push({
      taskId: r.taskId,
      taskName: r.task.namaTask,
      success: r.success,
      timeOnTask: r.timeOnTask,
    });
  }

  return NextResponse.json(Array.from(groupedByResponden.values()));
}