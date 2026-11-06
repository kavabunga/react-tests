import type { Message } from '../../shared/schemas'

import { handleAccountsUpdatedMessage } from './updateAccounts'

export function handleAccountsMessage(message: Message) {
  switch (message.action) {
    case 'updated':
      return handleAccountsUpdatedMessage(message)
  }
}
