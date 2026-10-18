export type RetryOptions =
  | {
      maxAttempts?: number
      minDelay?: number
      maxDelay?: number
    }
  | undefined

export class Retry {
  private attempts: number = 0
  // 0 means infinite attempts
  private maxAttempts: number
  private minDelay: number
  private maxDelay: number
  private timeout: number | null = null

  constructor(options?: RetryOptions) {
    this.maxAttempts = options?.maxAttempts ?? 0
    this.minDelay = options?.minDelay ?? 1000
    this.maxDelay = options?.maxDelay ?? 30000
  }

  start(retry: () => void): void {
    if (this.maxAttempts > 0 && this.attempts >= this.maxAttempts) {
      console.warn('Max attempts reached')
      return
    }

    if (this.attempts === 0) {
      this.attempts++
      retry()
      return
    }

    const delay = Math.min(this.minDelay * Math.pow(2, this.attempts - 1), this.maxDelay)

    this.timeout = setTimeout(() => {
      this.attempts++
      retry()
    }, delay)
  }

  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    this.attempts = 0
  }
}
