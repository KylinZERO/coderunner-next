import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      problem: { select: { id: true, title: true, language: true, difficulty: true } },
      testResults: {
        include: { testCase: true },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    submission: {
      id: submission.id, code: submission.code, language: submission.language,
      status: submission.status, score: submission.score, feedback: submission.feedback,
      createdAt: submission.createdAt,
      user: submission.user,
      problem: submission.problem,
      totalTests: submission.testResults.length,
      passedTests: submission.testResults.filter(tr => tr.passed).length,
      testResults: submission.testResults.map(tr => ({
        id: tr.id, input: tr.testCase.input,
        expectedOutput: tr.testCase.expectedOutput, isSample: tr.testCase.isSample,
        passed: tr.passed, actualOutput: tr.actualOutput,
        errorMessage: tr.errorMessage, executionTime: tr.executionTime,
      })),
    },
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json()
  const { score, feedback } = body

  const submission = await prisma.submission.update({
    where: { id },
    data: {
      ...(score !== undefined && { score: Math.max(0, Math.min(100, score)) }),
      ...(feedback !== undefined && { feedback }),
      ...(body.score !== undefined || body.feedback !== undefined ? { reviewedBy: auth.userId } : {}),
    },
  })

  return NextResponse.json({ submission })
}
