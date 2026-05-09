'use client'

import Navbar from '@/components/Navbar'

const features = [
  {
    title: 'Automatic Grading',
    desc: 'Students receive instant scores and detailed feedback upon submission. Multi-language runtime support with comprehensive test case matrices — no more manual grading.',
    icon: '⚡',
    color: 'from-blue-500 to-blue-600',
    span: true,
  },
  {
    title: 'Plagiarism Detection',
    desc: 'Smart code similarity analysis engine to uphold academic integrity.',
    icon: '🔍',
    color: 'from-pink-500 to-rose-500',
    span: false,
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Class performance, problem difficulty distribution, and submission trends at a glance.',
    icon: '📊',
    color: 'from-amber-500 to-yellow-500',
    span: false,
  },
  {
    title: 'Online Code Editor',
    desc: 'Built-in Monaco editor with syntax highlighting for 20+ programming languages.',
    icon: '🖥️',
    color: 'from-emerald-500 to-green-500',
    span: false,
  },
  {
    title: 'Flexible Test Cases',
    desc: 'Custom test cases and scoring weights to fit any course structure.',
    icon: '📝',
    color: 'from-violet-500 to-purple-500',
    span: false,
  },
]

const steps = [
  { num: '1', title: 'Create Problems', desc: 'Instructors write problem descriptions, set up test cases, and define grading criteria', border: 'border-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
  { num: '2', title: 'Students Submit', desc: 'Students write code online and submit with one click for evaluation', border: 'border-pink-600', text: 'text-pink-600', bg: 'bg-pink-50' },
  { num: '3', title: 'Instant Feedback', desc: 'The system auto-grades submissions and generates detailed feedback reports', border: 'border-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const stats = [
  { value: '10,000+', label: 'Active Students' },
  { value: '500+', label: 'Courses Powered' },
  { value: '50,000+', label: 'Submissions Graded' },
  { value: '99.9%', label: 'Uptime' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden">
        {/* Full-page gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-500 via-sky-300 via-blue-100 to-gray-50" />

        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-400/20 blur-[80px] pointer-events-none" />
        <div className="absolute top-2/4 -left-16 w-56 h-56 rounded-full bg-pink-400/15 blur-[70px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-16 w-64 h-64 rounded-full bg-blue-400/20 blur-[80px] pointer-events-none" />

        {/* HERO */}
        <section className="relative px-4 pt-20 pb-28 sm:pt-28 sm:pb-36 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
            Code Runner,
            <br />
            Automated.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-xl mx-auto">
            From hours of manual grading to instant, automated assessment.
            <br className="hidden sm:block" />
            The code evaluation platform trusted by university educators.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/register"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:brightness-95 transition-all"
            >
              Get Started Free
            </a>
            <a
              href="/problems"
              className="inline-block bg-white/15 text-white font-medium px-8 py-3 rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-all"
            >
              Try to Use →
            </a>
          </div>

          {/* Code window mockup */}
          <div className="mt-10 mx-auto max-w-md bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-left overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="px-4 pb-4 font-mono text-sm leading-relaxed">
              <span className="text-blue-400">def</span>{' '}
              <span className="text-amber-300">solve</span>(nums):
              <br />
              <span className="ml-4">
                <span className="text-blue-400">return</span>{' '}
                <span className="text-emerald-300">sum</span>(nums)
              </span>
              <br />
              <span className="text-gray-500">  # ✅ Passed all test cases</span>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative px-4 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center drop-shadow">
              Everything you need to teach coding
            </h2>
            <p className="mt-3 text-blue-100 text-center text-lg">
              From problem creation to auto-grading — all in one platform
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`group bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5 ${f.span ? 'md:col-span-2' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${f.color} text-white shadow-sm`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative px-4 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 text-center text-lg">
              Three steps to complete a full coding assignment workflow
            </p>

            <div className="mt-14 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-0.5 bg-blue-200 z-0" />

              {steps.map((s, i) => (
                <div key={s.title} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-extrabold border-2 ${s.border} ${s.text} ${s.bg}`}
                  >
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-[200px] mx-auto">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS + CTA */}
        <section className="relative px-4 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Ready to transform your coding courses?
              </h3>
              <p className="mt-3 text-gray-500 text-lg">
                Join hundreds of educators already using CodeRunner
              </p>
              <a
                href="/register"
                className="mt-8 inline-block bg-blue-800 hover:bg-blue-900 text-white font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-blue-900/25 transition-all"
              >
                Get Started Free →
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
