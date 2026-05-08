# Student Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add student Dashboard, Submission History page, and Problem list search/filter to the CodeRunner platform.

**Architecture:** Two new API routes (dashboard stats + paginated submissions list), three new UI pages/components (Dashboard, Submissions, StatCard), and enhancements to existing pages (Problems search/filter, Navbar links). All APIs use existing JWT auth pattern via `getAuthFromRequest`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma (SQLite), JWT auth

**Spec:** [docs/superpowers/specs/2026-05-08-student-dashboard-history-search-design.md](../specs/2026-05-08-student-dashboard-history-search-design.md)

---

### Task 1: Dashboard API (`GET /api/dashboard`)

**Files:**
- Create: `src/app/api/dashboard/route.ts`

- [ ] **Step 1: Create the dashboard API route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalProblems = await prisma.problem.count({ where: { isPublished: true } })

    const userSubmissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      select: { problemId: true, score: true },
    })

    const uniqueSolved = new Set(userSubmissions.map(s => s.problemId)).size
    const totalScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0)
    const averageScore = userSubmissions.length > 0
      ? Math.round(totalScore / userSubmissions.length)
      : 0

    const recentSubmissions = await prisma.submission.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        problem: { select: { id: true, title: true } },
      },
    })

    const availableProblems = await prisma.problem.findMany({
      where: { isPublished: true },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({
      stats: {
        totalProblems,
        solvedProblems: uniqueSolved,
        averageScore,
        totalSubmissions: userSubmissions.length,
      },
      recentSubmissions: recentSubmissions.map(s => ({
        id: s.id,
        problemId: s.problem.id,
        problemTitle: s.problem.title,
        score: s.score,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
      })),
      availableProblems,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error|dashboard"` to check for compilation errors.

---

### Task 2: Submissions List API (`GET /api/submissions`)

**Files:**
- Create: `src/app/api/submissions/route.ts`

- [ ] **Step 1: Create the submissions list API route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthFromRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const problemId = searchParams.get('problemId')

    const where: any = { userId: auth.userId }
    if (problemId) {
      where.problemId = parseInt(problemId)
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          problem: { select: { id: true, title: true } },
        },
      }),
      prisma.submission.count({ where }),
    ])

    return NextResponse.json({
      submissions: submissions.map(s => ({
        id: s.id,
        problemId: s.problem.id,
        problemTitle: s.problem.title,
        score: s.score,
        status: s.status,
        language: s.language,
        createdAt: s.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Submissions list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error"` to check for compilation errors.

---

### Task 3: StatCard Component

**Files:**
- Create: `src/components/StatCard.tsx`

- [ ] **Step 1: Create the StatCard component**

```tsx
interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'amber'
}

const colorConfig = {
  blue: { bg: 'bg-blue-50 text-blue-600', ring: 'ring-blue-500' },
  green: { bg: 'bg-green-50 text-green-600', ring: 'ring-green-500' },
  amber: { bg: 'bg-amber-50 text-amber-600', ring: 'ring-amber-500' },
}

const icons = {
  blue: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  green: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  amber: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
}

export default function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const cfg = colorConfig[color]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          {icons[color]}
        </div>
        <div className="min-w-0">
          <div className="text-3xl font-bold text-gray-900 leading-tight">{value}</div>
          <div className="text-sm font-medium text-gray-900 mt-0.5">{title}</div>
          <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds**

No command needed — will be verified in Task 4 build step.

---

### Task 4: Dashboard Page (`/dashboard`)

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create the Dashboard page**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import StatCard from '@/components/StatCard'

interface SubmissionItem {
  id: number
  problemId: number
  problemTitle: string
  score: number | null
  status: string
  createdAt: string
}

interface DashboardData {
  stats: {
    totalProblems: number
    solvedProblems: number
    averageScore: number
    totalSubmissions: number
  }
  recentSubmissions: SubmissionItem[]
  availableProblems: { id: number; title: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    async function load() {
      try {
        // Fetch user info
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meData = await meRes.json()
        if (meData.user) setUserName(meData.user.name)

        // Fetch dashboard data
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load dashboard')
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12 text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700 font-medium">Retry</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {userName || 'Student'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Problems"
            value={data.stats.totalProblems}
            subtitle="Published problems"
            color="blue"
          />
          <StatCard
            title="Solved"
            value={`${data.stats.solvedProblems}/${data.stats.totalProblems}`}
            subtitle="Completed"
            color="green"
          />
          <StatCard
            title="Avg Score"
            value={`${data.stats.averageScore}%`}
            subtitle={`${data.stats.totalSubmissions} submissions`}
            color="amber"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Submissions</h2>
          {data.recentSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              No submissions yet. Start solving problems!
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {data.recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => router.push(`/submissions/${sub.id}`)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{sub.problemTitle}</div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${
                      sub.score === 100 ? 'text-green-600' :
                      sub.score !== null && sub.score >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {sub.score !== null ? `${sub.score}%` : '-'}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.status}
                    </span>
                    <span className="text-sm text-gray-400 min-w-[80px] text-right">
                      {formatTimeAgo(sub.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 text-sm">
          <Link href="/submissions" className="text-blue-600 hover:text-blue-700 font-medium">
            → Browse All Submissions
          </Link>
          <Link href="/problems" className="text-blue-600 hover:text-blue-700 font-medium">
            → Browse Problems
          </Link>
        </div>
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
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error"` — no errors expected.

---

### Task 5: Submission History Page (`/submissions`)

**Files:**
- Create: `src/app/submissions/page.tsx`

- [ ] **Step 1: Create the Submissions History page**

```tsx
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

  // Auth check — wait for mount before accessing localStorage
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    async function loadSubmissions() {
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

    loadSubmissions()
  }, [page, problemFilter])

  // Load problem list for filter dropdown
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
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error"` — no errors expected.

---

### Task 6: Problem List Search & Filter

**Files:**
- Modify: `src/app/problems/page.tsx`

- [ ] **Step 1: Add search and filter state and UI to the problems page**

Replace the existing problems page with the enhanced version:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProblemCard from '@/components/ProblemCard'

interface Problem {
  id: number
  title: string
  language: string
  difficulty: string
  updatedAt: string
  _count: { testCases: number }
}

export default function ProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/problems', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      })
      .then(data => {
        setProblems(data.problems)
      })
      .catch(err => {
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false
      if (languageFilter && p.language !== languageFilter) return false
      return true
    })
  }, [problems, searchTerm, difficultyFilter, languageFilter])

  const uniqueLanguages = useMemo(() => {
    return [...new Set(problems.map(p => p.language))]
  }, [problems])

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
          <p className="text-gray-500 mt-1">Select a problem to start coding</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">All Languages</option>
            {uniqueLanguages.map(lang => (
              <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading problems...</div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700 font-medium">Retry</button>
          </div>
        )}

        {!loading && !error && filteredProblems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {searchTerm || difficultyFilter || languageFilter
              ? 'No problems match your filters. Try different search terms.'
              : 'No problems available yet. Check back later.'}
          </div>
        )}

        {!loading && !error && filteredProblems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map(problem => (
              <ProblemCard
                key={problem.id}
                id={problem.id}
                title={problem.title}
                language={problem.language}
                difficulty={problem.difficulty}
                testCount={problem._count.testCases}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error"` — no errors expected.

---

### Task 7: Navbar Navigation Links

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Add Dashboard and Submissions navigation links**

Insert the new links between the CodeRunner logo and the user info section:

```tsx
// Add these imports at the top (Link is already imported)
// Find the <Link href="/problems" ...> section and add Dashboard and Submissions links after it

// Before:
//   <Link href="/problems" className="text-xl font-bold text-blue-600">CodeRunner</Link>

// After:
//   <Link href="/problems" className="text-xl font-bold text-blue-600">CodeRunner</Link>
//   <div className="flex items-center gap-4 ml-8">
//     <Link href="/dashboard" className={...}>Dashboard</Link>
//     <Link href="/problems" className={...}>Problems</Link>
//     <Link href="/submissions" className={...}>Submissions</Link>
//   </div>
```

The full updated Navbar code:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pathname])

  function handleLogout() {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    setUser(null)
    router.push('/login')
  }

  if (loading || !user) return null

  const linkClass = (path: string) =>
    `text-sm ${pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'} transition`

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              CodeRunner
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
              <Link href="/problems" className={linkClass('/problems')}>Problems</Link>
              <Link href="/submissions" className={linkClass('/submissions')}>Submissions</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role.toLowerCase()})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1 | grep -E "error|Error"` — no errors expected.

---

### Task 8: Final Build & Smoke Test

- [ ] **Step 1: Full production build**

Run: `cd e:/NextJs/coderunner-next && npx next build 2>&1`

Verify no type errors or compilation errors. Expected output includes routes:
- `○ /dashboard`
- `○ /submissions` (static page, fetches data client-side)
- `ƒ /api/dashboard`
- `ƒ /api/submissions`

- [ ] **Step 2: Commit all changes**

```bash
cd e:/NextJs/coderunner-next
git add -A
git commit -m "feat: add student dashboard, submission history, and problem search"
```
