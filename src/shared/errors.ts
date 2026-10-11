export class ApiError extends Error {
  status: number
  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options)
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
