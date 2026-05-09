import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const search = searchParams.get('search') || ''
  const difficulty = searchParams.get('difficulty') || ''

  const where: any = {}
  if (search) where.title = { contains: search, mode: 'insensitive' }
  if (difficulty) where.difficulty = difficulty

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { testCases: true, submissions: true } } },
    }),
    prisma.problem.count({ where }),
  ])

  return NextResponse.json({
    problems: problems.map(p => ({
      id: p.id, title: p.title, language: p.language, difficulty: p.difficulty,
      isPublished: p.isPublished, tags: p.tags, timeLimit: p.timeLimit,
      testCaseCount: p._count.testCases, submissionCount: p._count.submissions,
      createdAt: p.createdAt, updatedAt: p.updatedAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, language, difficulty, templateCode, timeLimit, isPublished, tags } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const problem = await prisma.problem.create({
      data: {
        title, description,
        language: language || 'python',
        difficulty: difficulty || 'EASY',
        templateCode: templateCode || '',
        timeLimit: timeLimit || 5,
        isPublished: isPublished !== false,
        tags: tags || '',
      },
    })

    return NextResponse.json({ problem }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
