import { queryClient } from '../../shared/client'
import type { Message, Account, AccountList } from '../../shared/schemas'

import { accountKeys } from './queries'

export function handleAccountsMessage(message: Message) {
  switch (message.action) {
    case 'updated':
      return handleAccountsUpdatedMessage(message)
  }
}

function handleAccountsUpdatedMessage(message: Message) {
  const cachedData = queryClient.getQueryData<AccountList>(accountKeys.all)

  // Keep the revision updates consistent
  // TODO: Попробовать запрашивать разницу между revision и message.revision
  // TODO: Добавить throttling обновлений и буфер для сообщенений
  if (!cachedData) return

  // If new revision is older than the current revision, return the old data
  // TODO: Это может никогда не произойти
  if (cachedData.revision >= message.revision) return

  // If the revision is too old, invalidate the query
  // TODO: Добавить поддержку на бэкенде для выдачи только разницы между revision и message.revision
  if (cachedData.revision < message.revision - 1) {
    queryClient.invalidateQueries({ queryKey: accountKeys.all }, { cancelRefetch: false })
    return
  }

  const cachedAccount = cachedData.accounts.get(message.id)

  // If the account is not found, invalidate the query
  if (!cachedAccount) {
    queryClient.invalidateQueries({ queryKey: accountKeys.all }, { cancelRefetch: false })
    return
  }

  // Updating the query data directly due to high frequency of updates
  queryClient.setQueryData(accountKeys.all, () =>
    updateAccountsQueryData(cachedData, cachedAccount, message),
  )
}

function updateAccountsQueryData(oldData: AccountList, oldAccount: Account, message: Message) {
  const { id, revision, changes } = message

  const newAccounts = new Map(oldData.accounts)
  newAccounts.set(id, { ...oldAccount, ...changes })

  return { revision, accounts: newAccounts }
}
