'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

interface SubmissionItem {
  id: number
  userId: number
  userName: string
  problemId: number
  problemTitle: string
  score: number | null
  status: string
  language: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TeacherSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

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
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        const res = await fetch(`/api/teacher/submissions?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load submissions')
        const data = await res.json()
        setSubmissions(data.submissions)
        setPagination(data.pagination)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, router])

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const columns = [
    {
      key: 'userName',
      header: 'Student',
      render: (item: SubmissionItem) => (
        <span className="font-medium text-gray-900">{item.userName}</span>
      ),
    },
    {
      key: 'problemTitle',
      header: 'Problem',
    },
    {
      key: 'score',
      header: 'Score',
      render: (item: SubmissionItem) => {
        if (item.score === null) return <span className="text-gray-400">-</span>
        const variant = item.score >= 80 ? 'success' : item.score >= 50 ? 'warning' : 'error'
        return <StatusBadge variant={variant}>{item.score}%</StatusBadge>
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: SubmissionItem) => (
        <StatusBadge variant={item.status === 'COMPLETED' ? 'success' : 'neutral'}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      render: (item: SubmissionItem) => (
        <span className="uppercase text-xs font-medium text-gray-500">{item.language}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Time',
      render: (item: SubmissionItem) => (
        <span className="text-gray-400">{formatTimeAgo(item.createdAt)}</span>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-500 mt-1">Review and grade student submissions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={submissions}
        onRowClick={(item) => router.push(`/teacher/submissions/${item.id}`)}
        loading={loading}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= (pagination?.totalPages || 1)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
