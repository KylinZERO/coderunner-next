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

interface TestResultsProps {
  results: TestResultItem[]
  totalTests?: number
  passedTests?: number
}

export default function TestResults({ results, totalTests, passedTests }: TestResultsProps) {
  if (results.length === 0) return null

  return (
    <div className="space-y-3">
      {totalTests !== undefined && passedTests !== undefined && (
        <div className={`text-sm font-medium ${passedTests === totalTests ? 'text-green-600' : 'text-orange-600'}`}>
          {passedTests} / {totalTests} tests passed
          {totalTests > 0 && ` (${Math.round((passedTests / totalTests) * 100)}%)`}
        </div>
      )}

      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={result.testCaseId || index}
            className={`border rounded-lg p-3 ${
              result.passed
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                Test #{index + 1}
              </span>
              {result.isSample && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Sample</span>
              )}
              <span className={`ml-auto text-xs font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {result.input !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-medium">Input: </span>
                <span className="font-mono">{result.input || '(empty)'}</span>
              </div>
            )}

            {result.expectedOutput !== undefined && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Expected: </span>
                <span className="font-mono">{result.expectedOutput || '(empty)'}</span>
              </div>
            )}

            {result.actualOutput !== undefined && !result.passed && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Actual: </span>
                <span className="font-mono">{result.actualOutput || '(empty)'}</span>
              </div>
            )}

            {result.errorMessage && (
              <div className="text-xs text-red-600 mt-1 font-mono whitespace-pre-wrap">
                {result.errorMessage}
              </div>
            )}

            {result.executionTime !== undefined && result.executionTime !== null && (
              <div className="text-xs text-gray-400 mt-1">{result.executionTime}ms</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
