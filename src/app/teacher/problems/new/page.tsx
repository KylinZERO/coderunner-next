'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProblemPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('python')
  const [difficulty, setDifficulty] = useState('EASY')
  const [timeLimit, setTimeLimit] = useState(5)
  const [tags, setTags] = useState('')
  const [templateCode, setTemplateCode] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/teacher/problems', {
        method: 'POST',
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
        setError(data.error || 'Failed to create problem')
        return
      }

      router.push(`/teacher/problems/${data.problem.id}/edit`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const selectClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'

  return (
    <div>
      <div className="mb-6">
        <Link href="/teacher/problems" className="text-sm text-blue-600 hover:text-blue-700 transition">
          &larr; Back to Problems
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Problem</h1>
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
          <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Problem'}
          </button>
          <Link
            href="/teacher/problems"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
