import Link from 'next/link'

interface ProblemCardProps {
  id: number
  title: string
  language: string
  difficulty: string
  testCount: number
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
}

const difficultyLabels: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
}

export default function ProblemCard({ id, title, language, difficulty, testCount }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">{title}</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-600'}`}>
          {difficultyLabels[difficulty] || difficulty}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase">
          {language}
        </span>
        <span>{testCount} test cases</span>
      </div>
    </Link>
  )
}
