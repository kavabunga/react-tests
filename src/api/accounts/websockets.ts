import { WS_URL } from '../../shared/consts.ts'
import { parseMessage, type Message } from '../../shared/schemas.ts'

import { handleAccountsMessage } from './messages.ts'

let accountsWebSocket: WebSocket | null = null

export function getOrCreateAccountsWebSocket() {
  if (accountsWebSocket) return accountsWebSocket
  accountsWebSocket = new WebSocket(WS_URL)
  // TODO: Проверить что реконнект работает

  accountsWebSocket.onopen = () => {
    console.log('Accounts WebSocket opened')
  }

  accountsWebSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const message = parseMessage(data)
      routeMessage(message)
    } catch (error) {
      console.error('Accounts WebSocket message error:', error)
    }
  }

  accountsWebSocket.onerror = (event) => {
    console.error('Accounts WebSocket error:', event)
  }

  return accountsWebSocket
}

export function closeAccountsWebSocket() {
  if (accountsWebSocket) {
    accountsWebSocket.close()
    accountsWebSocket = null
  }
}

function routeMessage(message: Message) {
  switch (message.type) {
    case 'account':
      return handleAccountsMessage(message)
  }
}
