import { WS_URL } from '../../shared/consts.ts'
import { parseMessage, type Message } from '../../shared/schemas.ts'
import { WebsocketSubscription } from '../../shared/websocketSubscription.ts'

import { handleAccountsMessage } from './messages.ts'

function routeMessage(message: Message) {
  switch (message.type) {
    case 'account':
      return handleAccountsMessage(message)
  }
}

function onAccountsMessage(event: MessageEvent<string>) {
  try {
    const parsedData = JSON.parse(event.data)
    const message = parseMessage(parsedData)
    routeMessage(message)
  } catch (error) {
    console.error('Accounts WebSocket message error:', error)
  }
}

export const accountWebsocket = new WebsocketSubscription({
  url: WS_URL,
  onMessage: onAccountsMessage,
})
