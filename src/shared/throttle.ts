export type ThrottleCallback = () => boolean

interface ThrottleOptions {
  delay: number
}

export class Throttle {
  private timeout: number | null = null
  private delay: number = 0

  constructor({ delay }: ThrottleOptions) {
    this.delay = delay
  }

  private schedule(callback: ThrottleCallback): void {
    this.timeout = setTimeout(() => {
      this.timeout = null
      const isSuccess = callback()
      if (isSuccess) {
        this.schedule(callback)
      }
    }, this.delay)
  }

  throttle(callback: ThrottleCallback): void {
    if (this.timeout !== null) return

    const isSuccess = callback()

    if (!isSuccess) return

    this.schedule(callback)
  }

  setDelay(delay: number): void {
    this.delay = delay
  }
}
