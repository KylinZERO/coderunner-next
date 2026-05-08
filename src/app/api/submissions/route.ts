import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const problemId = searchParams.get('problemId')

    const where: any = { userId: auth.userId }
    if (problemId) {
      where.problemId = parseInt(problemId)
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          score: true,
          status: true,
          language: true,
          createdAt: true,
          problem: { select: { id: true, title: true } },
        },
      }),
      prisma.submission.count({ where }),
    ])

    return NextResponse.json({
      submissions: submissions.map(s => ({
        id: s.id,
        problemId: s.problem.id,
        problemTitle: s.problem.title,
        score: s.score,
        status: s.status,
        language: s.language,
        createdAt: s.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Submissions list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
