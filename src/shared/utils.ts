export function mergeMapWithPartial<T>(
  origin: Map<string, T>,
  updates: Map<string, Partial<T>>,
): Map<string, T> {
  const newMap = new Map(origin)
  for (const [id, update] of updates) {
    const value = newMap.get(id)

    // TODO: Добавить обработку ошибок
    if (!value) continue
    newMap.set(id, { ...value, ...update })
  }

  return newMap
}

export function mergeMaps<T>(origin: Map<string, T>, changes: Map<string, T>): Map<string, T> {
  const newMap = new Map(origin)
  for (const [key, value] of changes) {
    newMap.set(key, value)
  }
  return newMap
}
