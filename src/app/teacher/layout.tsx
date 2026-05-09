'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface User { id: number; name: string; email: string; role: string }

const sidebarLinks = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/teacher/problems', label: 'Problems', icon: '📝' },
  { href: '/teacher/submissions', label: 'Submissions', icon: '📨' },
  { href: '/teacher/students', label: 'Students', icon: '👥' },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'TEACHER') {
          router.push('/problems')
          return
        }
        setUser(data.user)
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  if (!user) return null

  function handleLogout() {
    localStorage.removeItem('token')
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/teacher/dashboard" className="text-xl font-bold text-blue-600">CodeRunner</Link>
          <p className="text-xs text-gray-500 mt-0.5">Teacher Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">{user.name} (teacher)</div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-600 transition w-full text-left">
            Sign out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
