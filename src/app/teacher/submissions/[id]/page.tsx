'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CodeEditor from '@/components/CodeEditor'
import TestResults from '@/components/TestResults'
import StatusBadge from '@/components/ui/StatusBadge'

interface ApiTestResultItem {
  id: number
  input: string
  expectedOutput: string
  isSample: boolean
  passed: boolean
  actualOutput: string
  errorMessage: string | null
  executionTime: number | null
}

interface TestResultForComponent {
  testCaseId: number
  input: string
  expectedOutput: string
  isSample: boolean
  passed: boolean
  actualOutput: string
  errorMessage: string | null
  executionTime: number | null
}

interface SubmissionData {
  id: number
  code: string
  language: string
  status: string
  score: number | null
  feedback: string | null
  createdAt: string
  user: { id: number; name: string; email: string }
  problem: { id: number; title: string; language: string; difficulty: string }
  totalTests: number
  passedTests: number
  testResults: TestResultForComponent[]
}

export default function TeacherSubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Grade section state
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch(`/api/teacher/submissions/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load submission')
        return res.json()
      })
      .then((data) => {
        const sub = data.submission
        // Map API test results to match TestResults component props
        const mappedTestResults = (sub.testResults || []).map(
          (tr: ApiTestResultItem) => ({
            testCaseId: tr.id,
            input: tr.input,
            expectedOutput: tr.expectedOutput,
            isSample: tr.isSample,
            passed: tr.passed,
            actualOutput: tr.actualOutput,
            errorMessage: tr.errorMessage,
            executionTime: tr.executionTime,
          })
        )
        setSubmission({ ...sub, testResults: mappedTestResults })
        setScore(sub.score ?? 0)
        setFeedback(sub.feedback ?? '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id, router])

  async function handleSaveGrade() {
    const token = localStorage.getItem('token')
    if (!token) return

    setSaving(true)
    setSaveMessage('')

    try {
      const res = await fetch(`/api/teacher/submissions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, feedback }),
      })

      if (!res.ok) throw new Error('Failed to save grade')

      // Refresh submission data to reflect updated score/feedback
      const refreshRes = await fetch(
        `/api/teacher/submissions/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        const sub = data.submission
        const mappedTestResults = (sub.testResults || []).map(
          (tr: ApiTestResultItem) => ({
            testCaseId: tr.id,
            input: tr.input,
            expectedOutput: tr.expectedOutput,
            isSample: tr.isSample,
            passed: tr.passed,
            actualOutput: tr.actualOutput,
            errorMessage: tr.errorMessage,
            executionTime: tr.executionTime,
          })
        )
        setSubmission({ ...sub, testResults: mappedTestResults })
      }

      setSaveMessage('Grade saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading submission...
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {error || 'Submission not found'}
        </p>
        <button
          onClick={() => router.push('/teacher/submissions')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to submissions
        </button>
      </div>
    )
  }

  const scoreVariant =
    submission.score === null
      ? 'neutral'
      : submission.score >= 80
        ? 'success'
        : submission.score >= 50
          ? 'warning'
          : 'error'

  return (
    <div>
      <button
        onClick={() => router.push('/teacher/submissions')}
        className="text-gray-400 hover:text-gray-600 transition mb-4 block"
      >
        ← Back to submissions
      </button>

      {/* Header: Student & Problem info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Student
            </h2>
            <p className="text-lg font-bold text-gray-900">
              {submission.user.name}
            </p>
            <p className="text-sm text-gray-500">{submission.user.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Problem
            </h2>
            <p className="text-lg font-bold text-gray-900">
              {submission.problem.title}
            </p>
            <p className="text-sm text-gray-500">
              Difficulty: {submission.problem.difficulty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <StatusBadge variant={scoreVariant}>
            Score:{' '}
            {submission.score !== null
              ? `${submission.score}%`
              : 'Not graded'}
          </StatusBadge>
          <StatusBadge
            variant={
              submission.status === 'COMPLETED' ? 'success' : 'neutral'
            }
          >
            {submission.status}
          </StatusBadge>
          <span className="text-xs text-gray-400 uppercase">
            {submission.language}
          </span>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Submitted Code</h2>
        <CodeEditor
          value={submission.code}
          language={submission.language}
          readOnly={true}
          onChange={() => {}}
        />
      </div>

      {/* Test Results */}
      {submission.testResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Test Results</h2>
          <TestResults
            results={submission.testResults}
            totalTests={submission.totalTests}
            passedTests={submission.passedTests}
          />
        </div>
      )}

      {/* Grade Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Grade Submission
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score (0-100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) =>
                setScore(
                  Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveGrade}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
            >
              {saving ? 'Saving...' : 'Save Grade'}
            </button>

            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.startsWith('Error')
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
