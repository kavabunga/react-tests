import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { WebSocketStatus } from '../../shared/websocket'

import { accountsQueryOptions } from './queries'
import { accountWebsocket } from './accountsWebsocket'
import { setAccountsUpdateThrottleDelay } from './updateAccounts'

export { WebSocketStatus }

const THROTTLE_DELAY_MS = 1000

export function useAccounts() {
  return useQuery(accountsQueryOptions())
}

export function useAccountsSync() {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.Closed)
  const [throttle, setThrottle] = useState(THROTTLE_DELAY_MS)

  useEffect(() => {
    const unsubscribe = accountWebsocket.subscribe({
      onStatusChange: setStatus,
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    setAccountsUpdateThrottleDelay(throttle)
  }, [throttle])

  return { status, throttle, setThrottle }
}
