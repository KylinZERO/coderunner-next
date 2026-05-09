import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const problemId = parseInt(params.id)
  if (isNaN(problemId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await request.json()
    const testCases = Array.isArray(body) ? body : [body]

    const created = await Promise.all(
      testCases.map(tc =>
        prisma.testCase.create({
          data: {
            problemId,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample || false,
            order: tc.order || 0,
          },
        })
      )
    )

    return NextResponse.json({ testCases: created }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
