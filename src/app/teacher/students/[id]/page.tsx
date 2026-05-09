'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

interface Student {
  id: number
  name: string
  email: string
}

interface ProblemStat {
  problemId: number
  problemTitle: string
  difficulty: string
  attempts: number
  bestScore: number
}

interface SubmissionItem {
  id: number
  problemId: number
  problemTitle: string
  difficulty: string
  score: number | null
  status: string
  language: string
  createdAt: string
}

interface DetailData {
  student: Student
  problemStats: ProblemStat[]
  submissions: SubmissionItem[]
}

function difficultyVariant(difficulty: string): 'success' | 'warning' | 'error' | 'info' {
  switch (difficulty) {
    case 'EASY': return 'success'
    case 'MEDIUM': return 'warning'
    case 'HARD': return 'error'
    default: return 'info'
  }
}

function scoreVariant(score: number | null): 'success' | 'warning' | 'error' {
  if (score === null) return 'error'
  if (score >= 100) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export default function TeacherStudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    async function load() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/teacher/students/${params.id}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load student details')
        const result = await res.json()
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading student details...</div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Student not found'}</p>
        <button
          onClick={() => router.push('/teacher/students')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to students
        </button>
      </div>
    )
  }

  const problemStatColumns = [
    { key: 'problemTitle', header: 'Problem' },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (stat: ProblemStat & { id: number }) => (
        <StatusBadge variant={difficultyVariant(stat.difficulty)}>
          {stat.difficulty.charAt(0) + stat.difficulty.slice(1).toLowerCase()}
        </StatusBadge>
      ),
    },
    { key: 'attempts', header: 'Attempts' },
    {
      key: 'bestScore',
      header: 'Best Score',
      render: (stat: ProblemStat & { id: number }) => (
        <StatusBadge variant={scoreVariant(stat.bestScore)}>
          {stat.bestScore}%
        </StatusBadge>
      ),
    },
  ]

  const submissionColumns = [
    { key: 'problemTitle', header: 'Problem' },
    {
      key: 'score',
      header: 'Score',
      render: (sub: SubmissionItem) => (
        <StatusBadge variant={scoreVariant(sub.score)}>
          {sub.score !== null ? `${sub.score}%` : '-'}
        </StatusBadge>
      ),
    },
    { key: 'status', header: 'Status' },
    { key: 'language', header: 'Language' },
    {
      key: 'createdAt',
      header: 'Time',
      render: (sub: SubmissionItem) => (
        <span className="text-gray-500">{formatTimeAgo(sub.createdAt)}</span>
      ),
    },
  ]

  const statsWithId = data.problemStats.map(s => ({ ...s, id: s.problemId }))

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/teacher/students')}
        className="text-gray-400 hover:text-gray-600 transition mb-4 block text-sm"
      >
        ← Back to students
      </button>

      {/* Student Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900">{data.student.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{data.student.email}</p>
      </div>

      {/* Problem Statistics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Problem Statistics</h2>
        <DataTable
          columns={problemStatColumns}
          data={statsWithId}
          loading={false}
        />
      </div>

      {/* All Submissions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Submissions</h2>
        <DataTable
          columns={submissionColumns}
          data={data.submissions}
          loading={false}
          onRowClick={(sub) => router.push(`/teacher/submissions/${sub.id}`)}
        />
      </div>
    </div>
  )
}
