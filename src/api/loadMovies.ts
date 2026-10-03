import { isResponse, processError } from './utils'
import { videoListchema } from './schemas'
import { BACKEND_URL } from './const'

export async function loadMovies() {
  const response = await fetch(`${BACKEND_URL}/videos`)
  if (!isResponse(response)) {
    throw processError(response)
  }
  const data = await response.json()
  return videoListchema.parse(data)
}
