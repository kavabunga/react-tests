import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from './shared/client.ts'

import App from './App.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
