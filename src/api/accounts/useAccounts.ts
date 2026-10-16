import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { accountsQueryOptions } from './queries'
import { getOrCreateAccountsWebSocket, closeAccountsWebSocket } from './websockets'

// TODO: разбить на два хука: useAccounts и useAccountsSync
export function useAccounts() {
  const queryClient = useQueryClient()

  useEffect(() => {
    getOrCreateAccountsWebSocket()

    return closeAccountsWebSocket
  }, [queryClient])

  return useQuery(accountsQueryOptions())
}
