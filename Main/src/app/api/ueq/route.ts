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

    // Cek responden
    const respondent = await prisma.responden.findUnique({
      where: { id: respondentIdNum }
    });
    if (!respondent) {
      return NextResponse.json(
        { error: 'Responden tidak ditemukan' },
        { status: 404 }
      );
    }

    // Simpan jawaban UEQ
    const answerEntries = Object.entries(answers);

    for (const [questionIdStr, score] of answerEntries) {
      const questionId = parseInt(questionIdStr);
      if (isNaN(questionId)) continue;

      // Cek apakah pertanyaan UEQ ada
      const question = await prisma.uEQQuestion.findUnique({
        where: { id: questionId }
      });
      if (!question) {
        console.warn(`Pertanyaan UEQ dengan id ${questionId} tidak ditemukan`);
        continue;
      }

      // Upsert jawaban
      await prisma.uEQAnswer.upsert({
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

    return NextResponse.json({ success: true, message: 'Jawaban UEQ berhasil disimpan' });
  } catch (error) {
    console.error('Error saving UEQ answers:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan jawaban UEQ' },
      { status: 500 }
    );
  }
}

// Optional GET
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const respondenId = searchParams.get('respondenId');
    if (!respondenId) {
      return NextResponse.json({ error: 'respondenId diperlukan' }, { status: 400 });
    }
    const answers = await prisma.uEQAnswer.findMany({
      where: { respondenId: parseInt(respondenId) },
      include: { question: true }
    });
    return NextResponse.json({ success: true, data: answers });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil jawaban UEQ' }, { status: 500 });
  }
}