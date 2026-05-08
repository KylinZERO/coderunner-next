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

    const results = []
    for (const testCase of problem.testCases) {
      const startTime = Date.now()
      const result = await executeCode(code, problem.language, testCase.input, problem.timeLimit)
      const executionTime = Date.now() - startTime
      const passed = !result.error && compareOutput(result.stdout, testCase.expectedOutput)

      results.push({
        testCaseId: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout,
        passed,
        error: result.error,
        errorMessage: result.stderr || null,
        executionTime,
      })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Run error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
