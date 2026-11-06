export class Queue<T> {
  private queue: T[] = []
  private queueLimit: number

  constructor(options?: { queueLimit: number }) {
    this.queueLimit = options?.queueLimit ?? 1000
  }

  getQueue(): T[] {
    return this.queue
  }

  add(item: T): void {
    this.queue.push(item)
    if (this.queue.length > this.queueLimit) {
      this.queue.shift()
    }
  }

  filterQueue(filter: (item: T) => boolean): void {
    this.queue = this.queue.filter(filter)
  }

  clear() {
    this.queue = []
  }
}
