import { execSync, exec } from 'child_process'
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export interface ExecutionResult {
  stdout: string
  stderr: string
  exitCode: number | null
  timedOut: boolean
  error?: string
}

export function executeCode(
  code: string,
  language: string,
  input: string = '',
  timeLimit: number = 5
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let timedOut = false

    const tmpDir = mkdtempSync(join(tmpdir(), 'coderunner-'))
    const ext = language === 'python' ? '.py' : '.js'
    const filePath = join(tmpDir, `code${ext}`)

    try {
      writeFileSync(filePath, code)

      const command = language === 'python'
        ? `python "${filePath}"`
        : `node "${filePath}"`

      const startTime = Date.now()

      try {
        stdout = execSync(command, {
          input,
          timeout: timeLimit * 1000,
          maxBuffer: 1024 * 1024,
          encoding: 'utf-8',
          windowsHide: true,
        })

        resolve({
          stdout: stdout.trim(),
          stderr: '',
          exitCode: 0,
          timedOut: false,
        })
      } catch (execError: any) {
        if (execError.killed || execError.signal === 'SIGTERM') {
          timedOut = true
        }
        stderr = (execError.stderr || execError.message || '').toString().trim()
        stdout = (execError.stdout || '').toString().trim()

        resolve({
          stdout,
          stderr: stderr.substring(0, 2000),
          exitCode: execError.status ?? 1,
          timedOut,
          error: timedOut ? 'TimeLimitExceeded' : stderr ? 'RuntimeError' : undefined,
        })
      } finally {
        try { unlinkSync(filePath) } catch {}
        try { execSync(`rmdir "${tmpDir}" 2>/dev/null || rm -rf "${tmpDir}"`) } catch {}
      }
    } catch (err: any) {
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        timedOut: false,
        error: 'RuntimeError',
      })
    }
  })
}

export function compareOutput(actual: string, expected: string): boolean {
  return actual.trim() === expected.trim()
}
