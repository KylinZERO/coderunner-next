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
      return NextResponse.json({ error: 'Invalid problem ID' }, { status: 400 })
    }

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: {
          where: { isSample: true },
          select: { id: true, input: true, expectedOutput: true, isSample: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Problem detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
