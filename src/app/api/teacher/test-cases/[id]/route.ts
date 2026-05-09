import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await request.json()
  const testCase = await prisma.testCase.update({ where: { id }, data: body })
  return NextResponse.json({ testCase })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request)
  if (!auth || auth.role !== 'TEACHER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  await prisma.testCase.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
