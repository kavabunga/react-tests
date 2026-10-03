import { useMovies } from './api/useMovies'
import type { CatalogueVideo } from './api/schemas'
import type { SortDirection } from './types'

import './MoviesList.css'
import { FavoriteButton } from './FavoriteButton'
import { useUpdateFavorite } from './api/useUpdateFavorite'

function sortByYear(movies: CatalogueVideo[], direction: SortDirection = 'asc') {
  return movies.sort((a, b) => {
    const yearA = a.year ?? 0
    const yearB = b.year ?? 0
    return direction === 'asc' ? yearA - yearB : yearB - yearA
  })
}

interface MoviesListProps {
  sortDirection: SortDirection
}

export function MoviesList({ sortDirection }: MoviesListProps) {
  const movies = useMovies()

  // if (isLoading) {
  //   return <p>Loading...</p>
  // }

  // if (!movies) {
  //   return <p>No movies found</p>
  // }

  const sortedMovies = sortByYear(movies, sortDirection)

  return (
    <div
      style={{
        flexDirection: 'column',
        display: 'flex',
        gap: '10px',
      }}
    >
      {/* <button onClick={fetch}>Обновить список</button> */}
      <ul className="movies-list">
        {sortedMovies.map((movie) => (
          <li key={movie.id}>
            <Movie movie={movie} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Movie({ movie }: { movie: CatalogueVideo }) {
  const { error, isLoading, fetch } = useUpdateFavorite()

  return (
    <article className="movie-item">
      <div className="movie-header">
        <h2 className="movie-heading">{movie.title}</h2>
        <FavoriteButton
          toggleFavorite={() => fetch({ id: movie.id, isFavorite: !movie.isFavorite })}
          isFavorite={movie.isFavorite}
          isLoading={isLoading}
        />
      </div>
      <p className="movie-overview">{movie.overview}</p>
      {error && <p className="movie-error">{error.message}</p>}
    </article>
  )
}
