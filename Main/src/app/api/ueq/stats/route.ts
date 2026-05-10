// app/api/ueq/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get('platformId');

    const whereCondition = platformId && platformId !== 'all'
      ? { responden: { platformId: parseInt(platformId) } }
      : {};

    const answers = await prisma.uEQAnswer.findMany({
      where: whereCondition,
      include: { question: true },
    });

    const categories = [
      'Attractiveness',
      'Perspicuity',
      'Efficiency',
      'Dependability',
      'Stimulation',
      'Novelty',
    ];

    const results: { category: string; average: number }[] = [];
    let totalSum = 0;
    let totalCount = 0;

    for (const category of categories) {
      const relevantAnswers = answers.filter(a => a.question.category === category);
      if (relevantAnswers.length === 0) {
        results.push({ category, average: 0 });
        continue;
      }
      const totalScore = relevantAnswers.reduce((sum, a) => sum + a.score, 0);
      const average = totalScore / relevantAnswers.length;
      results.push({ category, average: parseFloat(average.toFixed(2)) });
      totalSum += totalScore;
      totalCount += relevantAnswers.length;
    }

    const overallAverage = totalCount > 0
      ? parseFloat((totalSum / totalCount).toFixed(2))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        categories: results,
        overallAverage
      }
    });
  } catch (error) {
    console.error('Error fetching UEQ stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data UEQ' },
      { status: 500 }
    );
  }
}