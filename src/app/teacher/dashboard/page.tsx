'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/StatCard'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'

interface Stats {
  totalProblems: number
  totalStudents: number
  totalSubmissions: number
  todaySubmissions: number
}

interface ProblemAnalyticsItem {
  id: number
  title: string
  difficulty: string
  totalSubmissions: number
  averageScore: number | null
  passRate: number | null
}

interface RecentSubmissionItem {
  id: number
  userId: number
  userName: string
  problemId: number
  problemTitle: string
  score: number | null
  status: string
  createdAt: string
}

interface DashboardData {
  stats: Stats
  problemAnalytics: ProblemAnalyticsItem[]
  recentSubmissions: RecentSubmissionItem[]
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months !== 1 ? 's' : ''} ago`
}

function getScoreVariant(score: number | null): 'success' | 'warning' | 'error' | 'neutral' {
  if (score === null) return 'neutral'
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

function getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'error' {
  switch (difficulty) {
    case 'EASY': return 'success'
    case 'MEDIUM': return 'warning'
    default: return 'error'
  }
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/teacher/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setData)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        Loading...
      </div>
    )
  }

  if (!data) return null

  const { stats, problemAnalytics, recentSubmissions } = data

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          subtitle="Problems in system"
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled students"
          color="green"
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          subtitle="All time submissions"
          color="amber"
        />
        <StatCard
          title="Today's Submissions"
          value={stats.todaySubmissions}
          subtitle="Submissions today"
          color="blue"
        />
      </div>

      {/* Problem Analytics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Analytics</h2>
        <DataTable
          columns={[
            { key: 'title', header: 'Title' },
            {
              key: 'difficulty',
              header: 'Difficulty',
              render: (item: ProblemAnalyticsItem) => (
                <StatusBadge variant={getDifficultyVariant(item.difficulty)}>
                  {item.difficulty}
                </StatusBadge>
              ),
            },
            { key: 'totalSubmissions', header: 'Submissions' },
            {
              key: 'averageScore',
              header: 'Avg Score',
              render: (item: ProblemAnalyticsItem) =>
                item.averageScore !== null ? item.averageScore : 'N/A',
            },
            {
              key: 'passRate',
              header: 'Pass Rate',
              render: (item: ProblemAnalyticsItem) =>
                item.passRate !== null ? `${item.passRate}%` : 'N/A',
            },
          ]}
          data={problemAnalytics}
          onRowClick={(item: ProblemAnalyticsItem) =>
            router.push(`/teacher/problems/${item.id}/edit`)
          }
        />
      </section>

      {/* Recent Submissions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h2>
        <DataTable
          columns={[
            { key: 'userName', header: 'Student' },
            { key: 'problemTitle', header: 'Problem' },
            {
              key: 'score',
              header: 'Score',
              render: (item: RecentSubmissionItem) => (
                <StatusBadge variant={getScoreVariant(item.score)}>
                  {item.score !== null ? item.score : 'N/A'}
                </StatusBadge>
              ),
            },
            { key: 'status', header: 'Status' },
            {
              key: 'createdAt',
              header: 'Time',
              render: (item: RecentSubmissionItem) => relativeTime(item.createdAt),
            },
          ]}
          data={recentSubmissions}
          onRowClick={(item: RecentSubmissionItem) =>
            router.push(`/teacher/submissions/${item.id}`)
          }
        />
      </section>
    </div>
  )
}
