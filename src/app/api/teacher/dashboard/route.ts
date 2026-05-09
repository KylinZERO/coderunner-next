import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    totalProblems,
    totalStudents,
    totalSubmissions,
    todaySubmissions,
    problemStats,
    recentSubmissions,
  ] = await Promise.all([
    prisma.problem.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.submission.count(),
    prisma.submission.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.problem.findMany({
      select: {
        id: true, title: true, difficulty: true,
        _count: { select: { submissions: true } },
        submissions: { select: { score: true } },
      },
    }),
    prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, score: true, status: true, createdAt: true,
        user: { select: { id: true, name: true } },
        problem: { select: { id: true, title: true } },
      },
    }),
  ])

  const problemAnalytics = problemStats.map(p => {
    const scores = p.submissions.map(s => s.score).filter((s): s is number => s !== null)
    return {
      id: p.id, title: p.title, difficulty: p.difficulty,
      totalSubmissions: p._count.submissions,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      passRate: scores.length > 0
        ? Math.round((scores.filter(s => s >= 80).length / scores.length) * 100)
        : null,
    }
  })

  return NextResponse.json({
    stats: { totalProblems, totalStudents, totalSubmissions, todaySubmissions },
    problemAnalytics,
    recentSubmissions: recentSubmissions.map(s => ({
      id: s.id, userId: s.user.id, userName: s.user.name,
      problemId: s.problem.id, problemTitle: s.problem.title,
      score: s.score, status: s.status,
      createdAt: s.createdAt.toISOString(),
    })),
  })
}
