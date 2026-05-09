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
              {user.role === 'TEACHER' && (
                <Link href="/teacher/dashboard" className={linkClass('/teacher/dashboard')}>
                  Teacher Panel
                </Link>
              )}
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
