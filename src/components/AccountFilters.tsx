import { memo } from 'react'

import type { Tier } from '../shared/schemas'
import type { Filter } from './useFilterAccounts'

import './AccountFilters.css'

type AccountFilterProps = {
  filter: Filter
  setFilter: (filter: Filter) => void
}

export const AccountFilter = memo(function AccountFilter({
  filter,
  setFilter,
}: AccountFilterProps) {
  return (
    <div className="account-filter">
      <input
        type="text"
        placeholder="Filter by name"
        value={filter.name ?? ''}
        onChange={(e) => setFilter({ ...filter, name: e.target.value })}
      />
      <select
        value={filter.tier ?? ''}
        onChange={(e) =>
          e.target.value !== ''
            ? setFilter({ ...filter, tier: e.target.value as Tier })
            : setFilter({ ...filter, tier: undefined })
        }
      >
        <option value="">All</option>
        <option value="priority">Priority</option>
        <option value="regular">Regular</option>
      </select>
      <input
        type="number"
        placeholder="Min amount"
        min={0}
        value={filter.amount?.min ?? ''}
        onChange={(e) =>
          setFilter({
            ...filter,
            amount: { ...filter?.amount, min: e.target.value ? Number(e.target.value) : undefined },
          })
        }
      />
      <input
        type="number"
        min={0}
        placeholder="Max amount"
        value={filter.amount?.max ?? ''}
        onChange={(e) =>
          setFilter({
            ...filter,
            amount: { ...filter?.amount, max: e.target.value ? Number(e.target.value) : undefined },
          })
        }
      />
      <button type="button" onClick={() => setFilter({})}>
        Clear
      </button>
    </div>
  )
})
