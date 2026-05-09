'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import TestResults from '@/components/TestResults'

interface TestCase {
  id: number
  input: string
  expectedOutput: string
  isSample: boolean
  order: number
}

interface Problem {
  id: number
  title: string
  description: string
  language: string
  difficulty: string
  templateCode: string
  timeLimit: number
  testCases: TestCase[]
}

interface TestResultItem {
  testCaseId: number
  input?: string
  expectedOutput?: string
  actualOutput?: string
  passed: boolean
  error?: string | null
  errorMessage?: string | null
  executionTime?: number | null
  isSample?: boolean
}

export default function ProblemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<TestResultItem[]>([])
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [hasUnsaved, setHasUnsaved] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`/api/problems/${params.id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load problem')
        return res.json()
      })
      .then(data => {
        setProblem(data.problem)
        setCode(data.problem.templateCode || '')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id])

  // Warn before leaving with unsaved code
  useEffect(() => {
    if (!hasUnsaved) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsaved])

  const handleCodeChange = useCallback((value: string) => {
    setCode(value)
    setHasUnsaved(true)
  }, [])

  function requireAuth() {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push(`/login?redirect=/problems/${params.id}`)
      return false
    }
    return true
  }

  async function handleRun() {
    if (!requireAuth()) return
    const token = localStorage.getItem('token')

    setRunning(true)
    setResults([])
    setSubmissionId(null)

    try {
      const res = await fetch(`/api/problems/${params.id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  async function handleSubmit() {
    if (!requireAuth()) return
    const token = localStorage.getItem('token')

    setSubmitting(true)
    setResults([])
    setSubmissionId(null)

    try {
      const res = await fetch(`/api/problems/${params.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResults(data.submission.testResults)
      setSubmissionId(data.submission.id)
      setHasUnsaved(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12 text-gray-400">Loading problem...</div>
      </div>
    )
  }

  if (error && !problem) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push('/problems')} className="text-blue-600 hover:text-blue-700 font-medium">
            Back to problems
          </button>
        </div>
      </div>
    )
  }

  if (!problem) return null

  const passedTests = results.filter(r => r.passed).length
  const isGuest = !localStorage.getItem('token')

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/problems')}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            problem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
            problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {problem.difficulty}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium uppercase text-gray-600">
            {problem.language}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {problem.description}
              </div>
            </div>

            {problem.testCases.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Sample Test Cases</h2>
                <div className="space-y-3">
                  {problem.testCases.map((tc, i) => (
                    <div key={tc.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-700 mb-1">Example {i + 1}</div>
                      <div className="text-gray-600">
                        <span className="font-medium">Input:</span>{' '}
                        <span className="font-mono">{tc.input || '(empty)'}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Expected Output:</span>{' '}
                        <span className="font-mono">{tc.expectedOutput || '(empty)'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {problem.timeLimit && (
              <div className="text-xs text-gray-400">
                Time limit: {problem.timeLimit} seconds
              </div>
            )}

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-700">
              <strong>Tips:</strong> Use <strong>Run</strong> to test your code against sample test cases.
              Use <strong>Submit</strong> to officially submit and receive your score including hidden tests.
            </div>
          </div>

          {/* Right Panel - Code Editor & Results */}
          <div className="space-y-4">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={problem.language}
            />

            {isGuest ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <p className="text-amber-800 font-medium mb-2">Sign in to run and submit code</p>
                <p className="text-amber-700 text-sm mb-4">
                  You can view the problem description and test cases, but running code and submitting requires an account.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push(`/login?redirect=/problems/${params.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => router.push(`/register?redirect=/problems/${params.id}`)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-5 py-2 rounded-lg text-sm transition"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <button
                    onClick={handleRun}
                    disabled={running || submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {running ? 'Running...' : '▶ Run'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={running || submitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : '↑ Submit'}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                {error}
                <button onClick={() => setError('')} className="float-right font-medium">Dismiss</button>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {submissionId ? 'Submission Results' : 'Run Results'}
                  </h3>
                  {submissionId && (
                    <span className="text-xs text-gray-500">
                      Submission #{submissionId}
                    </span>
                  )}
                </div>
                <TestResults
                  results={results}
                  totalTests={results.length}
                  passedTests={passedTests}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
