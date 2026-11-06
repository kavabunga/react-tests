import { queryOptions, type QueryFunctionContext } from '@tanstack/react-query'
import { isApiError } from '../../shared/errors'
import { type AccountList } from '../../shared/schemas'
import { mergeMaps } from '../../shared/utils'
import { queryClient } from '../../shared/client'

import { fetchAccounts } from './fetchAccounts'

const ACCOUNTS_MAX_RETRY_COUNT = 3

const accountKeys = {
  all: ['accounts'] as const,
}

async function getAccounts({ signal, client }: QueryFunctionContext<typeof accountKeys.all>) {
  // Запрашиваем только изменения между текущей версией и новой версией
  const currentRevision = client.getQueryData<AccountList>(accountKeys.all)?.revision
  const newAccountsList = await fetchAccounts({ query: { revision: currentRevision }, signal })

  // Здесь нам важно получить текущие аккаунты именно после фетча, ё
  // чтобы все что в них добавится по вебсокетам пока идет фетч, было учтено

  // TODO: Проверить создается ли тут реально новый объект или он мутирутся и можно деструктуризировать его выше
  // NOTE: SetQueryData не мутирует объект, а создает новый, поэтому не нужно деструктуризировать client.getQueryData выше
  const currentAccounts = client.getQueryData<AccountList>(accountKeys.all)?.accounts

  if (currentAccounts) {
    const { accounts, revision } = newAccountsList
    return {
      accounts: mergeMaps(currentAccounts, accounts),
      revision,
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

export function getCachedAccounts() {
  return queryClient.getQueryData<AccountList>(accountKeys.all)
}

export function getAccountsQueryState() {
  return queryClient.getQueryState(accountKeys.all)
}

export function setCachedAccounts(accounts: AccountList) {
  queryClient.setQueryData(accountKeys.all, () => accounts)
}

export function invalidateCachedAccounts() {
  queryClient.invalidateQueries({ queryKey: accountKeys.all }, { cancelRefetch: false })
}
