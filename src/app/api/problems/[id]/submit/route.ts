import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'
import { executeCode, compareOutput } from '@/lib/code-execution'

export async function POST(
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
      return NextResponse.json({ error: 'Invalid problem ID' }, { status: 400 })
    }

    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    // Run all test cases
    const testResults = []
    let passedCount = 0

    for (const testCase of problem.testCases) {
      const startTime = Date.now()
      const result = await executeCode(code, problem.language, testCase.input, problem.timeLimit)
      const executionTime = Date.now() - startTime
      const passed = !result.error && compareOutput(result.stdout, testCase.expectedOutput)

      if (passed) passedCount++

      testResults.push({
        testCaseId: testCase.id,
        passed,
        actualOutput: result.stdout,
        errorMessage: result.stderr ? result.stderr.substring(0, 2000) : '',
        executionTime,
      })
    }

    const score = problem.testCases.length > 0
      ? Math.round((passedCount / problem.testCases.length) * 100)
      : 0

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        userId: auth.userId,
        problemId: id,
        code,
        language: problem.language,
        status: 'COMPLETED',
        score,
        testResults: {
          create: testResults,
        },
      },
      include: {
        testResults: {
          include: { testCase: true },
        },
      },
    })

    return NextResponse.json({
      submission: {
        id: submission.id,
        score: submission.score,
        status: submission.status,
        totalTests: problem.testCases.length,
        passedTests: passedCount,
        testResults: submission.testResults.map(tr => ({
          id: tr.id,
          testCaseId: tr.testCaseId,
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
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
