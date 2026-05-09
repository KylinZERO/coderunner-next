import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      testCases: { orderBy: { order: 'asc' } },
    },
  })
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ problem })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await request.json()
    const { title, description, language, difficulty, templateCode, timeLimit, isPublished, tags } = body

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(language !== undefined && { language }),
        ...(difficulty !== undefined && { difficulty }),
        ...(templateCode !== undefined && { templateCode }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(isPublished !== undefined && { isPublished }),
        ...(tags !== undefined && { tags }),
      },
    })

    return NextResponse.json({ problem })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  await prisma.problem.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
