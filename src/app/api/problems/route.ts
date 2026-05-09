import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const problems = await prisma.problem.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        language: true,
        difficulty: true,
        updatedAt: true,
        _count: { select: { testCases: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ problems })
  } catch (error) {
    console.error('Problems list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
