'use client'

import { useState, useEffect } from 'react'
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

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
          <p className="text-gray-500 mt-1">Select a problem to start coding</p>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading problems...</div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && problems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No problems available yet. Check back later.
          </div>
        )}

        {!loading && !error && problems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {problems.map(problem => (
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
