import { queryOptions } from '@tanstack/react-query'
import { API_URL } from '../../shared/consts'
import { ApiError, isApiError } from '../../shared/errors'
import { parseAccountList, type AccountList } from '../../shared/schemas'

const ACCOUNTS_MAX_RETRY_COUNT = 3

export const accountKeys = {
  all: ['accounts'] as const,
}

async function fetchAccounts({ signal }: { signal: AbortSignal }): Promise<AccountList> {
  const response = await fetch(`${API_URL}/accounts`, { signal })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.error ?? `HTTP ${response.status}`, response.status)
  }

  const data = await response.json()
  const accountList = parseAccountList(data)
  return accountList
}

export function accountsQueryOptions() {
  return queryOptions({
    queryKey: accountKeys.all,
    queryFn: fetchAccounts,
    staleTime: Infinity,
    // TODO: Показать что данные устарели и запросить обновление
    retry: (failureCount, error) =>
      // Retry on 5xx errors, up to MAX_RETRY_COUNT times
      isApiError(error) && error.status >= 500 && failureCount < ACCOUNTS_MAX_RETRY_COUNT,
  })
}
