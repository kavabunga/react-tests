import { API_URL } from '../../shared/consts'
import { ApiError } from '../../shared/errors'
import { parseAccountList, type AccountList, type AccountListQuery } from '../../shared/schemas'

function createAccountsURL(query?: AccountListQuery) {
  const url = new URL(`${API_URL}/accounts`)
  if (query?.revision !== undefined) {
    url.searchParams.set('revision', query.revision.toString())
  }
  return url.toString()
}

export async function fetchAccounts({
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
