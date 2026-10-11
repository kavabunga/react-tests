import { useCallback, useMemo, useState } from 'react'
import type { Account } from '../shared/schemas'

type SortDirection = 'asc' | 'desc'

type SortState = {
  column: keyof Account | null
  direction: SortDirection
}

export function useSortAccounts(accounts: Account[]) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: 'asc' })

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      const direction = sortState.direction === 'asc' ? 1 : -1
      if (sortState.column === 'clientName')
        return direction * compareStrings(a.clientName, b.clientName)
      if (sortState.column === 'lastOperationAt')
        return direction * compareDates(a.lastOperationAt, b.lastOperationAt)
      if (sortState.column === 'amount') return direction * compareNumbers(a.amount, b.amount)
      if (sortState.column === 'tier') return direction * compareStrings(a.tier, b.tier)
      return 0
    })
  }, [accounts, sortState])

  const sort = useCallback((column: keyof Account) => {
    setSortState((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { column, direction: 'desc' }
    })
  }, [])

  return { sortedAccounts, sort, sortState }
}

function compareStrings(a: string, b: string) {
  return a.localeCompare(b)
}

function compareNumbers(a: number, b: number) {
  return a - b
}

function compareDates(a: Date, b: Date) {
  return a.getTime() - b.getTime()
}
