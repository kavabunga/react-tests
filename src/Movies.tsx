import { Suspense, useState } from 'react'
import { MoviesFilters } from './MoviesFilters'
import './Movies.css'
import type { SortDirection } from './types'
import { MoviesList } from './MoviesList'
import { ErrorBoundary } from 'react-error-boundary'

export function Movies() {
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  return (
    <div className="container">
      <MoviesFilters sortDirection={sortDirection} setSortDirection={setSortDirection} />
      <ErrorBoundary fallback={<p>Error</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <MoviesList sortDirection={sortDirection} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
