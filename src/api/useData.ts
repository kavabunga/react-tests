import { useCallback, useEffect, useState } from 'react'
import { processError } from './utils'

type useDataOptions<T> = {
  fetchFn: () => Promise<T>
}

type useDataResult<T> = {
  data: T | null
  error: Error | null
  isLoading: boolean
  fetch: () => Promise<void>
}

const Status = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

type Status = (typeof Status)[keyof typeof Status]

export function useData<T>({ fetchFn }: useDataOptions<T>): useDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  // статус лучше здесь. ошибка тоже может быть статусом
  const [isLoading, setIsLoading] = useState(true)
  // const [status, setStatus] = useState<Status>('idle')

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchFn()
      setError(null)
      setData(data)
    } catch (error) {
      setError(processError(error))
    } finally {
      // батчинг собирает это вместе с loading и ошибкой вместе
      setIsLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, error, isLoading, fetch: fetchData }
}
