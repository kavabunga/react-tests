import { QueryClient, queryOptions } from '@tanstack/react-query'
import { API_URL } from '../../shared/consts'
import { ApiError, isApiError } from '../../shared/errors'
import {
  parseAccountList,
  type AccountList,
  type AccountListQuery,
  type AccountsUpdatesBatch,
} from '../../shared/schemas'
import { queryClient } from '../../shared/client'
import { mergeAccounts, parseNumbersRange } from './utils'

const ACCOUNTS_MAX_RETRY_COUNT = 3

export const accountKeys = {
  all: ['accounts'] as const,
}

function createAccountsURL(query?: AccountListQuery) {
  const url = new URL(`${API_URL}/accounts`)
  if (query?.revision !== undefined) {
    url.searchParams.set('revision', query.revision.toString())
  }
  return url.toString()
}

async function fetchAccounts({
  query,
  signal,
}: {
  query?: AccountListQuery
  signal: AbortSignal
}): Promise<AccountList> {
  const url = createAccountsURL(query)
  const response = await fetch(url, { signal })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.error ?? `HTTP ${response.status}`, response.status)
  }

  const data = await response.json()
  const newAccountsList = parseAccountList(data)

  return newAccountsList
}

async function getAccounts({
  signal,
  client,
}: {
  signal: AbortSignal
  client: QueryClient
}): Promise<AccountList> {
  // Fetch only the difference between the current revision and the new revision
  const currentRevision = client.getQueryData<AccountList>(accountKeys.all)?.revision
  let newAccountsList = await fetchAccounts({ query: { revision: currentRevision }, signal })

  const currentAccounts = client.getQueryData<AccountList>(accountKeys.all)?.accounts

  if (currentAccounts) {
    const newAccounts = new Map(currentAccounts)
    for (const account of newAccountsList.accounts) {
      newAccounts.set(account[0], account[1])
    }
    return {
      ...newAccountsList,
      accounts: newAccounts,
    }
  }

  return newAccountsList
}

export function accountsQueryOptions() {
  return queryOptions({
    queryKey: accountKeys.all,
    queryFn: getAccounts,
    staleTime: Infinity,
    // TODO: если данные устарели, запросить обновление
    retry: (failureCount, error) =>
      // Retry on 5xx errors, up to MAX_RETRY_COUNT times
      isApiError(error) && error.status >= 500 && failureCount < ACCOUNTS_MAX_RETRY_COUNT,
  })
}

export function batchUpdateAccounts(updates: AccountsUpdatesBatch): boolean {
  const cachedData = queryClient.getQueryData<AccountList>(accountKeys.all)

  // Keep the revision updates consistent
  if (!cachedData) return false

  const currentRevision = cachedData.revision

  const filteredAndSortedUpdates = filterAndSortUpdates(updates, currentRevision)
  if (filteredAndSortedUpdates.length === 0) return false

  const newAccounts = mergeAccounts({
    accounts: cachedData.accounts,
    updates: filteredAndSortedUpdates,
  })

  const revisions = filteredAndSortedUpdates.map((update) => update.revision)
  const correctRevision = getNextCorrectRevision(currentRevision, revisions)
  const { end: endRevision } = parseNumbersRange(revisions)

  // Updating the query data directly due to high frequency of updates
  queryClient.setQueryData(accountKeys.all, () => ({
    revision: correctRevision,
    accounts: newAccounts,
  }))

  // If after the update the revision is not the last one from the batch, invalidate the query to fetch the next updates
  if (correctRevision !== endRevision) {
    console.warn(
      'Accounts update revision is not consistent. Fetching updates starting from that revision',
    )
    queryClient.invalidateQueries({ queryKey: accountKeys.all })
  }

  return true
}

function getNextCorrectRevision(currentRevision: number, revisions: number[]): number {
  const { start, lastUninterrupted } = parseNumbersRange(revisions)

  // Keep the current revision if there are missing revisions
  // between the current and the starting revision
  if (currentRevision < start - 1) {
    return currentRevision
  }

  return lastUninterrupted
}

function filterAndSortUpdates(
  updates: AccountsUpdatesBatch,
  currentRevision: number,
): AccountsUpdatesBatch {
  return [...updates]
    .filter((update) => update.revision > currentRevision)
    .sort((a, b) => a.revision - b.revision)
}
