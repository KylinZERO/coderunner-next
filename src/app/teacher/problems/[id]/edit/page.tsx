'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'

interface TestCase {
  id: number
  problemId: number
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
  timeLimit: number
  tags: string
  templateCode: string
  isPublished: boolean
  testCases: TestCase[]
}

const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const selectClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'

export default function EditProblemPage() {
  const router = useRouter()
  const params = useParams()
  const problemId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('python')
  const [difficulty, setDifficulty] = useState('EASY')
  const [timeLimit, setTimeLimit] = useState(5)
  const [tags, setTags] = useState('')
  const [templateCode, setTemplateCode] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [problemNotFound, setProblemNotFound] = useState(false)

  // Test cases state
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testCasesLoading, setTestCasesLoading] = useState(true)

  // Add test case form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInput, setNewInput] = useState('')
  const [newExpectedOutput, setNewExpectedOutput] = useState('')
  const [newIsSample, setNewIsSample] = useState(false)
  const [newOrder, setNewOrder] = useState(0)

  // Edit test case form
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)
  const [editInput, setEditInput] = useState('')
  const [editExpectedOutput, setEditExpectedOutput] = useState('')
  const [editIsSample, setEditIsSample] = useState(false)
  const [editOrder, setEditOrder] = useState(0)

  const [testError, setTestError] = useState('')

  function getToken(): string | null {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return null
    }
    return token
  }

  async function fetchProblem() {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`/api/teacher/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 404) {
          setProblemNotFound(true)
        }
        throw new Error('Failed to load problem')
      }
      const data = await res.json()
      const p = data.problem
      setTitle(p.title)
      setDescription(p.description)
      setLanguage(p.language)
      setDifficulty(p.difficulty)
      setTimeLimit(p.timeLimit)
      setTags(p.tags || '')
      setTemplateCode(p.templateCode || '')
      setIsPublished(p.isPublished)
      setTestCases(p.testCases || [])
    } catch (err) {
      if (!problemNotFound) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setLoading(false)
      setTestCasesLoading(false)
    }
  }

  useEffect(() => {
    if (problemId) {
      fetchProblem()
    }
  }, [problemId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    const token = getToken()
    if (!token) return

    setSaving(true)

    try {
      const res = await fetch(`/api/teacher/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          language,
          difficulty,
          timeLimit,
          tags: tags.trim(),
          templateCode,
          isPublished,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update problem')
        return
      }

      setSuccess('Problem updated successfully')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Test case handlers
  async function handleAddTestCase() {
    if (!newInput.trim() || !newExpectedOutput.trim()) {
      setTestError('Input and expected output are required')
      return
    }

    const token = getToken()
    if (!token) return

    setTestError('')

    try {
      const res = await fetch(`/api/teacher/problems/${problemId}/test-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          input: newInput,
          expectedOutput: newExpectedOutput,
          isSample: newIsSample,
          order: newOrder,
        }),
      })

      if (!res.ok) throw new Error('Failed to add test case')

      setNewInput('')
      setNewExpectedOutput('')
      setNewIsSample(false)
      setNewOrder(testCases.length)
      setShowAddForm(false)
      fetchProblem()
    } catch {
      setTestError('Failed to add test case')
    }
  }

  async function handleUpdateTestCase() {
    if (!editingTestCase) return
    if (!editInput.trim() || !editExpectedOutput.trim()) {
      setTestError('Input and expected output are required')
      return
    }

    const token = getToken()
    if (!token) return

    setTestError('')

    try {
      const res = await fetch(`/api/teacher/test-cases/${editingTestCase.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          input: editInput,
          expectedOutput: editExpectedOutput,
          isSample: editIsSample,
          order: editOrder,
        }),
      })

      if (!res.ok) throw new Error('Failed to update test case')

      setEditingTestCase(null)
      fetchProblem()
    } catch {
      setTestError('Failed to update test case')
    }
  }

  async function handleDeleteTestCase(tc: TestCase) {
    const token = getToken()
    if (!token) return

    setTestError('')

    try {
      const res = await fetch(`/api/teacher/test-cases/${tc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete test case')

      fetchProblem()
    } catch {
      setTestError('Failed to delete test case')
    }
  }

  function startEdit(tc: TestCase) {
    setEditingTestCase(tc)
    setEditInput(tc.input)
    setEditExpectedOutput(tc.expectedOutput)
    setEditIsSample(tc.isSample)
    setEditOrder(tc.order)
  }

  function cancelEdit() {
    setEditingTestCase(null)
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading problem...</div>
    )
  }

  if (problemNotFound) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Problem Not Found</h1>
        <p className="text-gray-500 mb-4">The problem you are looking for does not exist.</p>
        <Link href="/teacher/problems" className="text-blue-600 hover:text-blue-700 font-medium">
          &larr; Back to Problems
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/teacher/problems" className="text-sm text-blue-600 hover:text-blue-700 transition">
          &larr; Back to Problems
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Problem</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-3xl">
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Problem title"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`${inputClass} font-mono`}
            placeholder="Problem description..."
            rows={12}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className={selectClass}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className={selectClass}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Time Limit (seconds)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={e => setTimeLimit(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              className={inputClass}
              min={1}
              max={30}
            />
          </div>

          <div>
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className={inputClass}
              placeholder="comma-separated tags"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Template Code</label>
          <textarea
            value={templateCode}
            onChange={e => setTemplateCode(e.target.value)}
            className={`${inputClass} font-mono`}
            placeholder="def solution():&#10;    pass"
            rows={10}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-lg text-sm">{success}</div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/teacher/problems"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Test Cases Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Test Cases</h2>
          <button
            onClick={() => {
              setShowAddForm(true)
              setEditingTestCase(null)
              setNewOrder(testCases.length)
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Add Test Case
          </button>
        </div>

        {testError && (
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-4">{testError}</div>
        )}

        {testCasesLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Loading test cases...
          </div>
        ) : testCases.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No test cases yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Input</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Output</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sample</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {testCases.map(tc => (
                    <tr key={tc.id}>
                      <td className="px-4 py-3 text-sm text-gray-700">{tc.order}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate font-mono">
                        {tc.input}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate font-mono">
                        {tc.expectedOutput}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {tc.isSample ? <StatusBadge variant="success">Sample</StatusBadge> : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(tc)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTestCase(tc)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Test Case Form */}
        {showAddForm && (
          <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">New Test Case</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Input</label>
                <textarea
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  rows={3}
                  placeholder="Test input"
                />
              </div>
              <div>
                <label className={labelClass}>Expected Output</label>
                <textarea
                  value={newExpectedOutput}
                  onChange={e => setNewExpectedOutput(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  rows={3}
                  placeholder="Expected output"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newIsSample"
                  checked={newIsSample}
                  onChange={e => setNewIsSample(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="newIsSample" className="text-sm text-gray-700">Sample</label>
              </div>
              <div>
                <label className="text-sm text-gray-700 mr-2">Order:</label>
                <input
                  type="number"
                  value={newOrder}
                  onChange={e => setNewOrder(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  min={0}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAddTestCase}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setTestError('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Test Case Form */}
        {editingTestCase && (
          <div className="mt-4 bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-blue-700">Edit Test Case #{editingTestCase.id}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Input</label>
                <textarea
                  value={editInput}
                  onChange={e => setEditInput(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  rows={3}
                />
              </div>
              <div>
                <label className={labelClass}>Expected Output</label>
                <textarea
                  value={editExpectedOutput}
                  onChange={e => setEditExpectedOutput(e.target.value)}
                  className={`${inputClass} font-mono text-sm`}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsSample"
                  checked={editIsSample}
                  onChange={e => setEditIsSample(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editIsSample" className="text-sm text-gray-700">Sample</label>
              </div>
              <div>
                <label className="text-sm text-gray-700 mr-2">Order:</label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={e => setEditOrder(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  min={0}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleUpdateTestCase}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
