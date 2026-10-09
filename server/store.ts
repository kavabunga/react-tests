export type Tier = 'priority' | 'regular'

export type Account = {
  id: string
  clientName: string
  amount: number
  lastOperationAt: string
  tier: Tier
}

export type AccountChanges = {
  amount?: number
  lastOperationAt?: string
}

export type AccountUpdated = {
  type: 'account.updated'
  revision: number
  id: string
  changes: AccountChanges
}

export type AccountList = {
  revision: number
  accounts: Account[]
}

const ACCOUNT_COUNT = 1000

const FIRST_NAMES = [
  'Anna',
  'Ben',
  'Clara',
  'David',
  'Elena',
  'Felix',
  'Grace',
  'Hugo',
  'Iris',
  'Jonah',
  'Kaia',
  'Leo',
  'Maya',
  'Noah',
  'Olga',
  'Paul',
  'Quinn',
  'Rosa',
  'Sam',
  'Tara',
  'Uma',
  'Victor',
  'Wendy',
  'Xavier',
  'Yara',
  'Zoe',
  'Adam',
  'Bianca',
  'Chris',
  'Diana',
  'Ethan',
  'Fiona',
  'George',
  'Hanna',
  'Ivan',
  'Julia',
  'Kevin',
  'Lara',
  'Marco',
  'Nina',
]

const LAST_NAMES = [
  'Adler',
  'Brooks',
  'Chen',
  'Diaz',
  'Ellis',
  'Fischer',
  'Gupta',
  'Hansen',
  'Ibrahim',
  'Jensen',
  'Khan',
  'Larsen',
  'Moreau',
  'Novak',
  'Ortiz',
  'Petrov',
  'Rossi',
  'Silva',
  'Torres',
  'Usman',
  'Vogel',
  'Walsh',
  'Xu',
  'Young',
  'Zimmerman',
]

type Row = {
  id: string
  clientName: string
  amountCents: number
  lastOperationAt: string
  tier: Tier
}

const rows = seedRows()
let revision = 0

export function listAccounts(): AccountList {
  const accounts = rows

    .map(toAccount)
    .sort(byRecentOperation)

  return { revision, accounts }
}

export function applyTick(count: number, now = new Date()): AccountUpdated[] {
  const updates = Math.min(count, rows.length)
  const picked = new Set<number>()
  while (picked.size < updates) {
    picked.add(Math.floor(Math.random() * rows.length))
  }

  const at = now.toISOString()
  const events: AccountUpdated[] = []
  for (const index of picked) {
    const row = rows[index]
    if (row === undefined) continue
    row.amountCents = nextAmountCents(row.amountCents)
    row.lastOperationAt = at
    revision += 1
    events.push({
      type: 'account.updated',
      revision,
      id: row.id,
      changes: {
        amount: centsToAmount(row.amountCents),
        lastOperationAt: row.lastOperationAt,
      },
    })
  }
  return events
}

function seedRows(): Row[] {
  if (FIRST_NAMES.length * LAST_NAMES.length < ACCOUNT_COUNT) {
    throw new Error(`Need at least ${ACCOUNT_COUNT} name pairs`)
  }

  const now = Date.now()
  const month = 30 * 24 * 60 * 60 * 1000
  const seeded: Row[] = []
  for (let index = 0; index < ACCOUNT_COUNT; index += 1) {
    const first = FIRST_NAMES[index % FIRST_NAMES.length]
    const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length)]
    if (first === undefined || last === undefined) {
      throw new Error(`Missing name for account ${index}`)
    }
    seeded.push({
      id: `acc_${String(index + 1).padStart(4, '0')}`,
      clientName: `${first} ${last}`,
      amountCents: randomInt(0, 2_500_000),
      lastOperationAt: new Date(now - randomInt(0, month)).toISOString(),
      tier: index % 10 === 0 ? 'priority' : 'regular',
    })
  }
  return seeded
}

function toAccount(row: Row): Account {
  return {
    id: row.id,
    clientName: row.clientName,
    amount: centsToAmount(row.amountCents),
    lastOperationAt: row.lastOperationAt,
    tier: row.tier,
  }
}

function byRecentOperation(a: Account, b: Account): number {
  if (a.lastOperationAt !== b.lastOperationAt) {
    return a.lastOperationAt < b.lastOperationAt ? 1 : -1
  }
  if (a.id < b.id) return -1
  if (a.id > b.id) return 1
  return 0
}

function nextAmountCents(current: number): number {
  const delta = randomInt(1, 10_000) * (Math.random() < 0.5 ? -1 : 1)
  const next = current + delta
  if (next >= 0) return next
  return current + Math.abs(delta)
}

function centsToAmount(cents: number): number {
  return cents / 100
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
