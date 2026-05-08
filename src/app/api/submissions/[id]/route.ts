import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        problem: {
          select: { id: true, title: true, language: true },
        },
        testResults: {
          include: {
            testCase: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Only allow own submissions (or teacher viewing all)
    if (submission.userId !== auth.userId && auth.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      submission: {
        id: submission.id,
        problem: submission.problem,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        score: submission.score,
        createdAt: submission.createdAt,
        totalTests: submission.testResults.length,
        passedTests: submission.testResults.filter(tr => tr.passed).length,
        testResults: submission.testResults.map(tr => ({
          id: tr.id,
          input: tr.testCase.input,
          expectedOutput: tr.testCase.expectedOutput,
          isSample: tr.testCase.isSample,
          passed: tr.passed,
          actualOutput: tr.actualOutput,
          errorMessage: tr.errorMessage,
          executionTime: tr.executionTime,
        })),
      },
    })
  } catch (error) {
    console.error('Submission detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
