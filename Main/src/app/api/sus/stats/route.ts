// app/api/sus/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get('platformId');

    // 1. Ambil semua pertanyaan SUS (urutkan berdasarkan id)
    const allQuestions = await prisma.sUSQuestion.findMany({
      orderBy: { id: 'asc' }
    });

    if (allQuestions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          averageScore: 0,
          totalRespondents: 0,
          distribution: { low: 0, medium: 0, high: 0 }
        }
      });
    }

    // 2. Filter jawaban berdasarkan platform (jika ada)
    const whereCondition = platformId && platformId !== 'all'
      ? { responden: { platformId: parseInt(platformId) } }
      : {};

    const answers = await prisma.sUSAnswer.findMany({
      where: whereCondition,
      include: {
        question: true,
        responden: true,
      },
    });

    if (answers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          averageScore: 0,
          totalRespondents: 0,
          distribution: { low: 0, medium: 0, high: 0 }
        }
      });
    }

    // 3. Kelompokkan jawaban per responden
    const respondentAnswers = new Map<number, Map<number, { score: number; isPositive: boolean }>>();

    for (const ans of answers) {
      const respondentId = ans.respondenId;
      const questionId = ans.questionId;
      const answerScore = ans.score;
      const isPositive = ans.question.isPositive;

      if (!respondentAnswers.has(respondentId)) {
        respondentAnswers.set(respondentId, new Map());
      }
      respondentAnswers.get(respondentId)!.set(questionId, { score: answerScore, isPositive });
    }

    // 4. Hitung skor SUS per responden
    const susScores: number[] = [];

    for (const [respondentId, answersMap] of respondentAnswers) {
      // Pastikan responden menjawab semua pertanyaan
      if (answersMap.size !== allQuestions.length) {
        console.warn(`Responden ${respondentId} hanya menjawab ${answersMap.size} dari ${allQuestions.length} pertanyaan`);
        continue;
      }

      let sum = 0;
      // Loop berdasarkan urutan pertanyaan yang benar
      for (const question of allQuestions) {
        const qAnswer = answersMap.get(question.id);
        if (!qAnswer) {
          sum = 0;
          break;
        }
        let itemScore = 0;
        if (qAnswer.isPositive) {
          itemScore = qAnswer.score - 1;
        } else {
          itemScore = 5 - qAnswer.score;
        }
        sum += itemScore;
      }

      if (sum === 0) continue; // skip jika ada yang tidak lengkap
      const susScore = sum * 2.5;
      susScores.push(susScore);
    }

    const averageScore = susScores.length > 0
      ? parseFloat((susScores.reduce((a, b) => a + b, 0) / susScores.length).toFixed(1))
      : 0;

    const low = susScores.filter(s => s < 51).length;
    const medium = susScores.filter(s => s >= 51 && s <= 68).length;
    const high = susScores.filter(s => s > 68).length;

    return NextResponse.json({
      success: true,
      data: {
        averageScore,
        totalRespondents: susScores.length,
        distribution: { low, medium, high }
      }
    });
  } catch (error) {
    console.error('Error fetching SUS stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data SUS' },
      { status: 500 }
    );
  }
}