import type { AccountsUpdatesBatch, AccountUpdate, Message } from '../../shared/schemas'
import { Throttle } from '../../shared/throttle'
import { Queue } from '../../shared/queue'
import { mergeMapWithPartial } from '../../shared/utils'

import {
  getAccountsQueryState,
  getCachedAccounts,
  invalidateCachedAccounts,
  setCachedAccounts,
} from './queries'

function batchWriteAccountsUpdates(updates: AccountsUpdatesBatch): number {
  const isFetching = getAccountsQueryState()?.fetchStatus === 'fetching'

  if (isFetching) throw new Error('Accounts are being fetched')

  const cachedData = getCachedAccounts()

  if (!cachedData) throw new Error('No cached accounts')

  const { isConsistent, filteredUpdates, revision } = filterConsistentRevisionUpdates(
    updates,
    cachedData.revision,
  )

  if (filteredUpdates.size > 0) {
    const newAccounts = mergeMapWithPartial(cachedData.accounts, filteredUpdates)

    setCachedAccounts({
      revision,
      accounts: newAccounts,
    })
  }

  if (!isConsistent) {
    console.warn(
      'Accounts update revision is not consistent. Fetching updates starting from that revision',
    )
    invalidateCachedAccounts()
  }

  return revision
}

type Update = { revision: number; id: string }

interface FilterConsistentRevisionUpdatesResult<T extends Update> {
  isConsistent: boolean
  filteredUpdates: Map<string, Omit<T, 'revision' | 'id'>>
  revision: number
}

function filterConsistentRevisionUpdates<T extends Update>(
  updates: T[],
  currentRevision: number,
): FilterConsistentRevisionUpdatesResult<T> {
  const filteredUpdates: Map<string, Omit<T, 'revision' | 'id'>> = new Map()
  let revision = currentRevision
  let isConsistent = true

  for (const { revision: updateRevision, id, ...update } of updates) {
    // Пропуск элементов со старой ревизией
    if (updateRevision <= revision) {
      continue
    }

    // Прерывание обработки если есть пропущенные ревизии
    if (updateRevision - 1 !== revision) {
      isConsistent = false
      break
    }

    filteredUpdates.set(id, { ...filteredUpdates.get(id), ...update })
    revision = updateRevision
  }

  return {
    isConsistent,
    filteredUpdates,
    revision,
  }
}

const accountsUpdateThrottle = new Throttle({ delay: 1000 })
const accountsUpdatesQueue = new Queue<AccountUpdate>({ queueLimit: 1000 })

function updateAccounts(): boolean {
  const updates = accountsUpdatesQueue.getQueue()
  if (!updates[0]) return false

  try {
    const revision = batchWriteAccountsUpdates(updates)
    accountsUpdatesQueue.filterQueue((update) => update.revision > revision)
    return true
  } catch (error) {
    if (error instanceof Error) {
      console.warn('Skipped updating accounts.', error.message)
    } else {
      console.warn('Unknown error', error)
    }
    return accountsUpdatesQueue.getQueue().length > 0
  }
}

export function handleAccountsUpdatedMessage(message: Message) {
  // TODO: Почему TS разрешает передать сюда Message вместо AccountUpdate ?!
  accountsUpdatesQueue.add({
    revision: message.revision,
    id: message.id,
    ...message.changes,
  })
  accountsUpdateThrottle.throttle(updateAccounts)
}

export function setAccountsUpdateThrottleDelay(delay: number): void {
  accountsUpdateThrottle.setDelay(delay)
}
