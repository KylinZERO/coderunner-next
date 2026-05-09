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
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch('/api/problems', { headers })
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
  }, [])

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false
      if (languageFilter && p.language !== languageFilter) return false
      return true
    })
  }, [problems, searchTerm, difficultyFilter, languageFilter])

  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(problems.map(p => p.language)))
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
