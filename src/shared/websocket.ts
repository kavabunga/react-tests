import { Retry, type RetryOptions } from './retry'

export const WebSocketStatus = {
  Connecting: 'connecting',
  Open: 'open',
  Closed: 'closed',
  Error: 'error',
} as const

export type WebSocketStatus = (typeof WebSocketStatus)[keyof typeof WebSocketStatus]

export interface WebSocketOptions {
  url: string
  onStatusChange?: (status: WebSocketStatus) => void
  onMessage?: (message: MessageEvent<string>) => void
  onError?: (error: Error) => void
  retryOptions?: RetryOptions
}

function createWebSocket(options: WebSocketOptions) {
  options?.onStatusChange?.(WebSocketStatus.Connecting)
  const newWebSocket = new WebSocket(options.url)

  newWebSocket.onopen = () => {
    console.log('WebSocket opened', options.url)
    options?.onStatusChange?.(WebSocketStatus.Open)
  }

  newWebSocket.onclose = () => {
    console.log('WebSocket closed', options.url)
    options?.onStatusChange?.(WebSocketStatus.Closed)
  }

  newWebSocket.onmessage = options.onMessage ?? (() => {})

  newWebSocket.onerror = (event) => {
    console.error('Accounts WebSocket error:', event)
    options?.onStatusChange?.(WebSocketStatus.Error)
    options?.onError?.(new Error('WebSocket error'))
  }

  return newWebSocket
}

export class WebSocketClient {
  private url: string
  private status: WebSocketStatus = WebSocketStatus.Closed
  private webSocket: WebSocket | null = null
  private onStatusChangeCallback: ((status: WebSocketStatus) => void) | undefined
  private onMessage: ((message: MessageEvent<string>) => void) | undefined
  private onError: ((error: Error) => void) | undefined
  private retry: Retry

  constructor(options: WebSocketOptions) {
    this.url = options.url
    this.onStatusChangeCallback = options.onStatusChange
    this.onMessage = options.onMessage
    this.onError = options.onError
    this.onStatusChange = this.onStatusChange.bind(this)
    this.retry = new Retry(options.retryOptions)
  }

  private onStatusChange(status: WebSocketStatus): void {
    this.status = status
    this.onStatusChangeCallback?.(status)

    if (status === WebSocketStatus.Open) {
      this.retry.clear()
    }

    if (status === WebSocketStatus.Closed) {
      this.retry.start(() => this.reconnect())
    }
  }

  private closeSocket(): void {
    if (this.webSocket) {
      // Detach the handlers to prevent unneeded calls
      this.webSocket.onclose = null
      this.webSocket.onopen = null
      this.webSocket.onerror = null
      this.webSocket.onmessage = null

      this.webSocket.close()
      this.webSocket = null
    }
  }

  getStatus(): WebSocketStatus {
    return this.status
  }

  close(): void {
    this.closeSocket()
    this.retry.clear()
    this.status = WebSocketStatus.Closed
  }

  connect(): void {
    this.webSocket = createWebSocket({
      url: this.url,
      onStatusChange: this.onStatusChange,
      onMessage: this.onMessage,
      onError: this.onError,
    })
  }

  reconnect(): void {
    this.closeSocket()
    this.connect()
  }

  get readyState(): WebSocket['readyState'] | undefined {
    return this.webSocket?.readyState
  }
}
