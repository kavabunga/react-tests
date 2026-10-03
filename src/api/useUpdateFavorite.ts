import { useCallback, useState } from 'react'
import { updateFavorite } from './updateFavorite'
import type { FavoriteMark } from './schemas'
import { processError } from './utils'

export function useUpdateFavorite() {
  const [data, setData] = useState<FavoriteMark | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async (query: FavoriteMark) => {
    setIsLoading(true)
    try {
      const data = await updateFavorite(query)
      setError(null)
      setData(data)
    } catch (error) {
      setError(processError(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, error, isLoading, fetch: fetchData }
}
