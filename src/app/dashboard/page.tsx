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
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const meData = await meRes.json()
        if (meData.user) setUserName(meData.user.name)

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
