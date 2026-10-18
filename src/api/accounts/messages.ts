import type { AccountChanges, AccountsUpdatesBatch, Message } from '../../shared/schemas'
import { batchUpdateAccounts } from './queries'

class AccountsUpdatesQueue {
  private updates: AccountsUpdatesBatch = []
  private queueLimit: number

  constructor(options?: { queueLimit: number }) {
    this.queueLimit = options?.queueLimit ?? 1000
  }

  getUpdates(): AccountsUpdatesBatch {
    return this.updates
  }

  add(id: string, changes: AccountChanges, revision: number): void {
    const update: AccountChanges & { revision: number; id: string } = { ...changes, revision, id }
    this.updates.push(update)
    if (this.updates.length > this.queueLimit) {
      this.updates.shift()
    }
  }

  clear() {
    this.updates = []
  }
}

interface AccountsUpdatesBatchControllerUpdateParams {
  id: string
  changes: AccountChanges
  revision: number
}

class AccountsUpdatesBatchController {
  private queue = new AccountsUpdatesQueue()
  private onUpdate: (updates: AccountsUpdatesBatch) => boolean
  private throttleTimeout: number | null = null
  private throttleDelay: number = 0

  constructor({ onUpdate }: { onUpdate: (updates: AccountsUpdatesBatch) => boolean }) {
    this.onUpdate = onUpdate
  }

  private update(): boolean {
    const updates = this.queue.getUpdates()
    if (!updates[0]) return false

    const isSuccess = this.onUpdate(updates)
    if (isSuccess) {
      this.queue.clear()
    }

    return isSuccess
  }

  private scheduleUpdate(): void {
    this.throttleTimeout = setTimeout(() => {
      this.throttleTimeout = null
      const isSuccess = this.update()
      if (isSuccess) {
        this.scheduleUpdate()
      }
    }, this.throttleDelay)
  }

  onUpdateMessage({ id, changes, revision }: AccountsUpdatesBatchControllerUpdateParams): void {
    this.queue.add(id, changes, revision)

    if (this.throttleTimeout !== null) {
      return
    }

    const isSuccess = this.update()

    if (isSuccess) {
      this.scheduleUpdate()
    }
  }

  setThrottleDelay(delay: number): void {
    this.throttleDelay = delay
  }
}

export const accountsUpdatesBatchController = new AccountsUpdatesBatchController({
  onUpdate: batchUpdateAccounts,
})

export function handleAccountsMessage(message: Message) {
  switch (message.action) {
    case 'updated':
      return handleAccountsUpdatedMessage(message)
  }
}

function handleAccountsUpdatedMessage(message: Message) {
  accountsUpdatesBatchController.onUpdateMessage(message)
}
