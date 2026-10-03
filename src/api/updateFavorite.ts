import { BACKEND_URL } from './const'
import { favoriteMarkSchema, type FavoriteMark } from './schemas'
import { isResponse } from './utils'

const createUrl = (id: string) => `${BACKEND_URL}/videos/${id}/favorite`

export async function updateFavorite(query: FavoriteMark) {
  const response = await fetch(createUrl(query.id), {
    method: 'PUT',
    body: JSON.stringify(query),
  })

  if (!isResponse(response)) {
    throw new Error('Invalid response')
  }

  const data = await response.json()

  const parsed = favoriteMarkSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid data')
  }

  return parsed.data
}
