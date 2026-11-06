import { WebSocketClient, type WebSocketOptions, WebSocketStatus } from './websocket'

interface Subscription {
  onStatusChange?: (status: WebSocketStatus) => void
}

export class WebsocketSubscription {
  private webSocketClient: WebSocketClient
  private subscriptions: Set<Subscription> = new Set()

  constructor(options: Omit<WebSocketOptions, 'onStatusChange'>) {
    this.webSocketClient = new WebSocketClient({
      ...options,
      onStatusChange: this.onStatusChange.bind(this),
    })
  }

  private unsubscribe(subscription: Subscription): void {
    this.subscriptions.delete(subscription)

    // Only disconnect if there are no subscriptions left
    if (this.subscriptions.size === 0) {
      this.webSocketClient.close()
    }
  }

  private onStatusChange(status: WebSocketStatus): void {
    for (const subscription of this.subscriptions) {
      subscription.onStatusChange?.(status)
    }
  }

  subscribe(options?: Subscription): () => void {
    const subscription = {
      ...options,
    }

    this.subscriptions.add(subscription)

    const status = this.webSocketClient.getStatus()
    options?.onStatusChange?.(status)

    if (status === WebSocketStatus.Closed) {
      this.webSocketClient.connect()
    }

    return () => this.unsubscribe(subscription)
  }
}
