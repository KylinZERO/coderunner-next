import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalProblems = await prisma.problem.count({ where: { isPublished: true } })

    const userSubmissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      select: { problemId: true, score: true },
    })

    const uniqueSolved = new Set(userSubmissions.map(s => s.problemId)).size
    const totalScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0)
    const averageScore = userSubmissions.length > 0
      ? Math.round(totalScore / userSubmissions.length)
      : 0

    const recentSubmissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        score: true,
        status: true,
        createdAt: true,
        problem: { select: { id: true, title: true } },
      },
    })

    const availableProblems = await prisma.problem.findMany({
      where: { isPublished: true },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({
      stats: {
        totalProblems,
        solvedProblems: uniqueSolved,
        averageScore,
        totalSubmissions: userSubmissions.length,
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        problemId: s.problem.id,
        problemTitle: s.problem.title,
        score: s.score,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
      availableProblems,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
