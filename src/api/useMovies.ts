import { use } from 'react'
import { getData } from './getData'
import { loadMovies } from './loadMovies'
// import { useData } from './useData'

export function useMovies() {
  // NOTE: Option with use()
  return use(getData('movies', loadMovies))

  // NOTE: Option with classic React hook
  // return useData({ fetchFn: loadMovies })
}
