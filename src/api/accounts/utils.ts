import type {
  Account,
  AccountChanges,
  AccountList,
  AccountsUpdatesBatch,
} from '../../shared/schemas'

function mergeAccount<T extends Account | AccountChanges>(account: T, changes: AccountChanges): T {
  return {
    ...account,
    ...changes,
  }
}

type Accounts = AccountList['accounts']

export function mergeAccounts({
  updates,
  accounts,
}: {
  updates: AccountsUpdatesBatch
  accounts: Accounts
}): Accounts {
  const newAccounts = new Map(accounts)
  for (const update of updates) {
    const { id, revision, ...changes } = update
    const account = newAccounts.get(id)
    // TODO: Add error handling
    if (!account) continue

    newAccounts.set(id, mergeAccount(account, changes))
  }

  return newAccounts
}

function findLastUninterruptedNumber(numbers: number[]): number {
  return numbers.reduce((lastUninterruptedNumber, number) => {
    if (number === lastUninterruptedNumber + 1) {
      return number
    }
    return lastUninterruptedNumber
  }, numbers[0])
}

export function parseNumbersRange(numbers: number[]): {
  start: number
  end: number
  lastUninterrupted: number
} {
  return {
    start: numbers[0],
    end: numbers[numbers.length - 1],
    lastUninterrupted: findLastUninterruptedNumber(numbers),
  }
}
