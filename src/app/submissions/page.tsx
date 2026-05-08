'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface SubmissionItem {
  id: number
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

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [problemFilter, setProblemFilter] = useState('')
  const [availableProblems, setAvailableProblems] = useState<{ id: number; title: string }[]>([])

  // Auth check
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!mounted) return
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [mounted, router])

  // Fetch submissions
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (problemFilter) params.set('problemId', problemFilter)

        const res = await fetch(`/api/submissions?${params}`, {
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
  }, [page, problemFilter])

  // Load problems for filter dropdown
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.availableProblems) setAvailableProblems(data.availableProblems)
      })
      .catch(() => {})
  }, [])

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Submission History</h1>
          <p className="text-gray-500 mt-1">View all your code submissions</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={problemFilter}
            onChange={e => { setProblemFilter(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">All Problems</option>
            {availableProblems.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-400">Loading submissions...</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700 font-medium">Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && submissions.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-2">No submissions yet</p>
            <button onClick={() => router.push('/problems')} className="text-blue-600 hover:text-blue-700 font-medium">
              Start solving problems
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && submissions.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-5 py-3 grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Problem</div>
                <div>Score</div>
                <div>Status</div>
                <div className="text-right">Date</div>
              </div>

              {/* Rows */}
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => router.push(`/submissions/${sub.id}`)}
                  className="px-5 py-4 grid grid-cols-5 gap-4 items-center hover:bg-gray-50 cursor-pointer transition border-t border-gray-100"
                >
                  <div className="col-span-2 font-medium text-gray-900 text-sm truncate">
                    {sub.problemTitle}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${
                      sub.score === 100 ? 'text-green-600' :
                      sub.score !== null && sub.score >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {sub.score !== null ? `${sub.score}%` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 text-right">
                    {formatTimeAgo(sub.createdAt)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
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
          </>
        )}
      </main>
    </div>
  )
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
