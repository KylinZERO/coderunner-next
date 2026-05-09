'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TestResults from '@/components/TestResults'

interface SubmissionData {
  id: number
  problem: { id: number; title: string; language: string }
  code: string
  language: string
  status: string
  score: number
  createdAt: string
  totalTests: number
  passedTests: number
  testResults: any[]
}

function GuestSubmissionDetail() {
  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submission Details</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Sign in to view your submission details, code, and test results.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsGuest(true)
      setLoading(false)
      return
    }

    fetch(`/api/submissions/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load submission')
        return res.json()
      })
      .then(data => {
        setSubmission(data.submission)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (isGuest) return <GuestSubmissionDetail />

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12 text-gray-400">Loading submission...</div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || 'Submission not found'}</p>
          <button onClick={() => router.push('/problems')} className="text-blue-600 hover:text-blue-700 font-medium">
            Back to problems
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push(`/problems/${submission.problem.id}`)}
          className="text-gray-400 hover:text-gray-600 transition mb-4 block"
        >
          ← Back to problem
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Submission #{submission.id}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {submission.problem.title} · {new Date(submission.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${submission.score === 100 ? 'text-green-600' : submission.score && submission.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {submission.score}%
              </div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <span className={`px-2.5 py-1 rounded-full font-medium ${
              submission.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {submission.status}
            </span>
            <span className="bg-gray-100 px-2.5 py-1 rounded font-medium uppercase text-gray-600 text-xs">
              {submission.language}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Submitted Code</h2>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
            {submission.code}
          </pre>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Test Results</h2>
          <TestResults
            results={submission.testResults}
            totalTests={submission.totalTests}
            passedTests={submission.passedTests}
          />
        </div>
      </main>
    </div>
  )
}
