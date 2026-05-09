'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Modal from '@/components/ui/Modal'

interface Problem {
  id: number
  title: string
  language: string
  difficulty: string
  isPublished: boolean
  tags: string
  timeLimit: number
  testCaseCount: number
  submissionCount: number
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const difficultyColor: Record<string, 'success' | 'warning' | 'error'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error',
}

export default function TeacherProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Problem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const fetchProblems = useCallback(async (page: number) => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (difficulty) params.set('difficulty', difficulty)
    params.set('page', String(page))

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/teacher/problems?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load problems')
      const data = await res.json()
      setProblems(data.problems)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [search, difficulty, router])

  useEffect(() => {
    fetchProblems(1)
  }, [fetchProblems])

  function handleSearchChange(value: string) {
    setSearch(value)
  }

  function handleDifficultyChange(value: string) {
    setDifficulty(value)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const token = localStorage.getItem('token')
    if (!token) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/teacher/problems/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Delete failed')
      setDeleteTarget(null)
      fetchProblems(pagination.page)
    } catch {
      setError('Failed to delete problem')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (item: Problem) => (
        <StatusBadge variant={difficultyColor[item.difficulty] || 'neutral'}>
          {item.difficulty}
        </StatusBadge>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      render: (item: Problem) => (
        <span className="capitalize">{item.language}</span>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (item: Problem) => (
        <StatusBadge variant={item.isPublished ? 'success' : 'neutral'}>
          {item.isPublished ? 'Published' : 'Draft'}
        </StatusBadge>
      ),
    },
    {
      key: 'testCaseCount',
      header: 'Test Cases',
    },
    {
      key: 'submissionCount',
      header: 'Submissions',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Problem) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Link
            href={`/teacher/problems/${item.id}/edit`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteTarget(item)}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Link href="/teacher/dashboard" className="text-gray-400 hover:text-gray-600 transition mb-4 block text-sm">
        ← Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
        <Link
          href="/teacher/problems/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          New Problem
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <select
          value={difficulty}
          onChange={e => handleDifficultyChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={problems}
        onRowClick={(item) => router.push(`/teacher/problems/${item.id}/edit`)}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProblems(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchProblems(p)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  p === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchProblems(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Problem"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
