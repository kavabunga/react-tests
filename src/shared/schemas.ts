import z from 'zod'

export const tierSchema = z.enum(['priority', 'regular'])

export const accountSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  amount: z.number(),
  lastOperationAt: z.string().transform((lastOperationAt) => new Date(lastOperationAt)),
  tier: tierSchema,
})

export const accountChangesSchema = accountSchema.partial()

export const accountChangesMessageSchema = z
  .object({
    type: z.string(),
    revision: z.number(),
    id: z.string(),
    changes: accountChangesSchema,
  })
  .transform(({ type, ...message }) => {
    const [newType, action] = type.split('.')
    return { type: newType, action, ...message }
  })

export const accountListQuerySchema = z.object({
  revision: z.number().optional(),
})

export const accountListSchema = z.object({
  revision: z.number(),
  accounts: z
    .array(accountSchema)
    .transform((accounts) => new Map(accounts.map((account) => [account.id, account]))),
})

export const messageSchema = z.union([accountChangesMessageSchema])

export type AccountChangesMessage = z.infer<typeof accountChangesMessageSchema>
export type AccountChanges = z.infer<typeof accountChangesSchema>
export type AccountListQuery = z.infer<typeof accountListQuerySchema>
export type AccountList = z.infer<typeof accountListSchema>
export type Account = z.infer<typeof accountSchema>
export type Tier = z.infer<typeof tierSchema>
export type Message = z.infer<typeof messageSchema>

export type AccountsUpdatesBatch = Array<AccountChanges & { revision: number; id: string }>

export function parseAccountList(data: unknown): AccountList {
  return accountListSchema.parse(data)
}

export function parseMessage(data: unknown): Message {
  return messageSchema.parse(data)
}
