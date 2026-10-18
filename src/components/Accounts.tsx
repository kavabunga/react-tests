import { memo, useCallback, useMemo } from 'react'

import { cn } from '../shared/cn'
import type { Account } from '../shared/schemas'
import { useAccounts, useAccountsSync, WebSocketStatus } from '../api/accounts/useAccounts'
import { useSortAccounts } from './useSortAccounts'
import { useFilterAccounts } from './useFilterAccounts'
import { AccountFilter } from './AccountFilters'

import './Accounts.css'

const CONNECTION_STATUS_LABELS = {
  [WebSocketStatus.Connecting]: 'Connecting',
  [WebSocketStatus.Open]: 'In Sync',
  [WebSocketStatus.Closed]: 'Out of Sync',
  [WebSocketStatus.Error]: 'Error',
}

const COLUMNS: { label: string; name: keyof Account }[] = [
  {
    label: 'Client Name',
    name: 'clientName',
  },
  {
    label: 'Client Tier',
    name: 'tier',
  },
  {
    label: 'Amount',
    name: 'amount',
  },
  {
    label: 'Last Operation',
    name: 'lastOperationAt',
  },
] as const

export function Accounts() {
  const { data, isLoading, error } = useAccounts()
  const { status, throttle, setThrottle } = useAccountsSync()

  const accountsList = useMemo(() => {
    return Array.from(data?.accounts.values() ?? [])
  }, [data])

  const { filteredAccounts, setFilter, filter } = useFilterAccounts(accountsList)
  const { sortedAccounts, sort, sortState } = useSortAccounts(filteredAccounts)

  const handleColumnNameClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const column = e.currentTarget.dataset.column as keyof Account
      sort(column)
    },
    [sort],
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="accounts-container">
      <div className="accounts-table-header-container">
        <div className="accounts-table-header-item">
          <h1 className="accounts-table-header">Accounts</h1>
          <span
            className={cn(
              'accounts-table-header-badge',
              status === WebSocketStatus.Open && 'active',
            )}
          >
            {CONNECTION_STATUS_LABELS[status]}
          </span>
        </div>
        <input
          className="accounts-table-header-input"
          type="number"
          value={throttle}
          onChange={(e) => setThrottle(Number(e.target.value))}
          min={0}
          max={10000}
        />
      </div>
      <AccountFilter filter={filter} setFilter={setFilter} />
      <table className="accounts-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <AccountColumn
                key={column.name}
                onClick={handleColumnNameClick}
                isSorted={sortState.column === column.name}
                {...column}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.map((account) => (
            <AccountRow key={account.id} {...account} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const AccountRow = memo(function AccountRow(account: Account) {
  return (
    <tr>
      {COLUMNS.map(({ name }) => {
        // TODO: Use a formatter function instead of toLocaleString
        if (name === 'lastOperationAt') {
          return <td key={name}>{account.lastOperationAt.toLocaleString()}</td>
        }
        return <td key={name}>{account[name]}</td>
      })}
    </tr>
  )
})

type AccountColumnProps = {
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  isSorted: boolean
} & (typeof COLUMNS)[number]

const AccountColumn = memo(function AccountColumn({
  name,
  label,
  onClick,
  isSorted,
}: AccountColumnProps) {
  return (
    <th onClick={onClick} data-column={name} className={cn(isSorted && 'sorted')}>
      {label}
    </th>
  )
})
