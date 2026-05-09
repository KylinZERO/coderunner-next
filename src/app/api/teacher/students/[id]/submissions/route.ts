import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = parseInt(params.id)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const [submissions, student] = await Promise.all([
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, score: true, status: true, language: true, createdAt: true,
        problem: { select: { id: true, title: true, difficulty: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    }),
  ])

  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // Calculate per-problem stats
  const problemMap = new Map<number, any>()
  for (const s of submissions) {
    if (!problemMap.has(s.problem.id)) {
      problemMap.set(s.problem.id, {
        problemId: s.problem.id, problemTitle: s.problem.title, difficulty: s.problem.difficulty,
        attempts: 0, bestScore: 0,
      })
    }
    const stat = problemMap.get(s.problem.id)
    stat.attempts++
    if (s.score !== null) {
      stat.bestScore = Math.max(stat.bestScore, s.score)
    }
  }

  return NextResponse.json({
    student,
    problemStats: Array.from(problemMap.values()),
    submissions: submissions.map(s => ({
      id: s.id, problemId: s.problem.id, problemTitle: s.problem.title,
      difficulty: s.problem.difficulty, score: s.score, status: s.status,
      language: s.language, createdAt: s.createdAt.toISOString(),
    })),
  })
}
