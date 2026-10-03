export function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function isResponse(response: unknown): response is Response {
  return response instanceof Response && response.ok
}

export function processError(error: unknown): Error {
  return isError(error) ? error : new Error(String(error))
}
