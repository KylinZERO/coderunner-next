import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const problemId = searchParams.get('problemId')
  const userId = searchParams.get('userId')

  const where: any = {}
  if (problemId) where.problemId = parseInt(problemId)
  if (userId) where.userId = parseInt(userId)

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
      select: {
        id: true, score: true, status: true, language: true, createdAt: true,
        user: { select: { id: true, name: true } },
        problem: { select: { id: true, title: true } },
      },
    }),
    prisma.submission.count({ where }),
  ])

  return NextResponse.json({
    submissions: submissions.map(s => ({
      id: s.id, userId: s.user.id, userName: s.user.name,
      problemId: s.problem.id, problemTitle: s.problem.title,
      score: s.score, status: s.status, language: s.language,
      createdAt: s.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
