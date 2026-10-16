import { createServer } from 'node:http'
import express from 'express'
import { WebSocket, WebSocketServer } from 'ws'
import { applyTick, listAccounts, type AccountUpdated } from './store.ts'

const TICK_MS = 1000
const UPDATES_PER_TICK = 3
const port = readPort(process.env.PORT)

const DROP_RATE = Number(process.env.CHAOS_DROP ?? 0)
const CORRUPT_RATE = Number(process.env.CHAOS_CORRUPT ?? 0)

const app = express()

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/accounts', (_req, res) => {
  res.json(listAccounts())
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
  const { revision, accounts } = listAccounts()
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

function readPort(value: string | undefined): number {
  if (value === undefined || value === '') return 3001
  const portNumber = Number(value)
  if (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535')
  }
  return portNumber
}
