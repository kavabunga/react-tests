import { useMemo, useState } from 'react'

import type { Account } from '../shared/schemas'

export type Filter = {
  tier?: 'priority' | 'regular'
  name?: string
  amount?: {
    min?: number
    max?: number
  }
}

export function useFilterAccounts(accounts: Account[]) {
  const [filter, setFilter] = useState<Filter>({})

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (!filter) return true

      if (filter.tier && account.tier !== filter.tier) return false
      if (filter.name && !account.clientName.toLowerCase().includes(filter.name.toLowerCase()))
        return false
      if (filter.amount?.min !== undefined && account.amount < filter.amount.min) return false
      if (filter.amount?.max !== undefined && account.amount > filter.amount.max) return false
      return true
    })
  }, [accounts, filter])

  return { filteredAccounts, setFilter, filter }
}
