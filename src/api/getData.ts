const cache = new Map<string, Promise<unknown>>()

export function getData<T>(key: string, fetchFunction: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    cache.set(key, fetchFunction())
  }
  return cache.get(key) as Promise<T>
}

export function clearCache(key: string) {
  cache.delete(key)
}
