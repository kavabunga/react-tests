import { createServer } from 'node:http'
import express, { type Request } from 'express'
import { WebSocket, WebSocketServer } from 'ws'
import { z } from 'zod'
import { applyTick, listAccounts, type AccountQuery, type AccountUpdated } from './store.ts'

const TICK_MS = 1000
const UPDATES_PER_TICK = 3
const port = readPort(process.env.PORT)

const DROP_RATE = Number(process.env.CHAOS_DROP ?? 0)
const CORRUPT_RATE = Number(process.env.CHAOS_CORRUPT ?? 0)

const accountQuerySchema = z.object({
  tier: z.enum(['priority', 'regular']).optional(),
  q: z.string().optional(),
  minAmount: z.coerce.number().finite().optional(),
  maxAmount: z.coerce.number().finite().optional(),
})

const app = express()

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/accounts', (req, res) => {
  const query = readAccountsQuery(req)
  if (query === undefined) {
    res.status(400).json({ error: 'Invalid query' })
    return
  }
  const { minAmount, maxAmount } = query
  if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    res.status(400).json({ error: 'minAmount is greater than maxAmount' })
    return
  }
  res.json(listAccounts(query))
})

const server = createServer(app)

// No backlog on purpose: a socket never receives diffs emitted before it connected.
const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (socket) => {
  socket.on('error', (error: Error) => {
    console.error('socket error', error.message)
  })
})

setInterval(() => {
  for (const event of applyTick(UPDATES_PER_TICK)) {
    broadcast(event)
  }
}, TICK_MS)

function fail(error: Error) {
  console.error(error.message)
  process.exit(1)
}

server.on('error', fail)
wss.on('error', fail)

server.listen(port, () => {
  const { revision, accounts } = listAccounts({})
  console.log(`Accounts API  http://localhost:${port}/accounts`)
  console.log(`WebSocket     ws://localhost:${port}/ws`)
  console.log(`${accounts.length} accounts, revision ${revision}`)
})

function broadcast(event: AccountUpdated) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      console.log('Client not open, skipping')
      continue
    }

    if (Math.random() < DROP_RATE) {
      console.log('Dropping message')
      continue
    }

    if (Math.random() < CORRUPT_RATE) {
      console.log('Corrupting message')
      const corrupted = {
        ...event,
        changes: { ...event.changes, amount: String(event.changes?.amount) },
      }
      client.send(JSON.stringify(corrupted))
      continue
    }

    client.send(JSON.stringify(event))
  }
}

function readAccountsQuery(req: Request): AccountQuery | undefined {
  const raw: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.query)) {
    const picked = Array.isArray(value) ? value[0] : value
    if (picked === undefined) continue
    if (typeof picked !== 'string') return undefined
    const trimmed = picked.trim()
    if (trimmed === '') continue
    raw[key] = trimmed
  }

  const parsed = accountQuerySchema.safeParse(raw)
  if (!parsed.success) return undefined
  return parsed.data
}

function readPort(value: string | undefined): number {
  if (value === undefined || value === '') return 3001
  const portNumber = Number(value)
  if (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535')
  }
  return portNumber
}
