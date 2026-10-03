import { cn } from './cn'

import './MoviesFilters.css'
import type { SortDirection } from './types'

interface MoviesFiltersProps {
  sortDirection: SortDirection
  setSortDirection: (direction: SortDirection) => void
}

export function MoviesFilters({ sortDirection, setSortDirection }: MoviesFiltersProps) {
  return (
    <div className="filter-buttons-group">
      <button
        className={cn('filter-button', sortDirection === 'asc' && 'active')}
        onClick={() => setSortDirection('asc')}
      >
        Sort by year ascending
      </button>
      <button
        className={cn('filter-button', sortDirection === 'desc' && 'active')}
        onClick={() => setSortDirection('desc')}
      >
        Sort by year descending
      </button>
    </div>
  )
}
