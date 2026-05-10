import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { respondenId, answers } = body;

    if (!respondenId || !answers) {
      return NextResponse.json(
        { error: 'respondenId dan answers diperlukan' },
        { status: 400 }
      );
    }

    const respondentIdNum = parseInt(respondenId);
    if (isNaN(respondentIdNum)) {
      return NextResponse.json(
        { error: 'respondenId harus berupa angka' },
        { status: 400 }
      );
    }

    // Cek apakah responden ada
    const respondent = await prisma.responden.findUnique({
      where: { id: respondentIdNum }
    });
    if (!respondent) {
      return NextResponse.json(
        { error: 'Responden tidak ditemukan' },
        { status: 404 }
      );
    }

    // Simpan setiap jawaban SUS
    const answerEntries = Object.entries(answers);

    for (const [questionIdStr, score] of answerEntries) {
      const questionId = parseInt(questionIdStr);
      if (isNaN(questionId)) continue;

      // Cek apakah pertanyaan ada
      const question = await prisma.sUSQuestion.findUnique({
        where: { id: questionId }
      });
      if (!question) {
        console.warn(`Pertanyaan dengan id ${questionId} tidak ditemukan, dilewati`);
        continue;
      }

      // Upsert jawaban (update jika sudah ada, create jika belum)
      await prisma.sUSAnswer.upsert({
        where: {
          respondenId_questionId: {
            respondenId: respondentIdNum,
            questionId: questionId
          }
        },
        update: {
          score: typeof score === 'string' ? parseInt(score) : score
        },
        create: {
          respondenId: respondentIdNum,
          questionId: questionId,
          score: typeof score === 'string' ? parseInt(score) : score
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Jawaban SUS berhasil disimpan' });
  } catch (error) {
    console.error('Error saving SUS answers:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan jawaban SUS' },
      { status: 500 }
    );
  }
}

// Opsional: GET untuk mengambil jawaban SUS (jika diperlukan)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const respondenId = searchParams.get('respondenId');

    if (!respondenId) {
      return NextResponse.json(
        { error: 'respondenId diperlukan' },
        { status: 400 }
      );
    }

    const answers = await prisma.sUSAnswer.findMany({
      where: { respondenId: parseInt(respondenId) },
      include: { question: true }
    });

    return NextResponse.json({ success: true, data: answers });
  } catch (error) {
    console.error('Error fetching SUS answers:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil jawaban SUS' },
      { status: 500 }
    );
  }
}