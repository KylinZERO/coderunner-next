'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  const handleMount = useCallback(() => {
    setMounted(true)
  }, [])

  const monacoLanguage = language === 'python' ? 'python' : language === 'javascript' ? 'javascript' : 'python'

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MonacoEditor
        height="400px"
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 4,
        }}
        loading={<div className="h-[400px] bg-gray-50 flex items-center justify-center text-gray-400">Loading editor...</div>}
      />
    </div>
  )
}
