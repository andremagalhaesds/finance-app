import { defaultCategory } from './categories'
import type { AppData, Transaction } from './types'

const STORAGE_KEY = 'finance-app-data'

const emptyData = (): AppData => ({ transactions: [] })

const migrateTransaction = (raw: Partial<Transaction> & { id: string }): Transaction => {
  const type = raw.type === 'income' ? 'income' : 'expense'
  return {
    id: raw.id,
    type,
    amount: Number(raw.amount) || 0,
    description: String(raw.description ?? ''),
    date: String(raw.date ?? new Date().toISOString().slice(0, 10)),
    category: raw.category ?? defaultCategory(type),
    recurrence: raw.recurrence === 'fixed' ? 'fixed' : 'variable',
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as AppData
    if (!Array.isArray(parsed.transactions)) return emptyData()
    return {
      transactions: parsed.transactions.map((t) =>
        migrateTransaction(t as Partial<Transaction> & { id: string }),
      ),
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addTransaction(data: AppData, tx: Transaction): AppData {
  const next = { transactions: [tx, ...data.transactions] }
  saveData(next)
  return next
}

export function removeTransaction(data: AppData, id: string): AppData {
  const next = {
    transactions: data.transactions.filter((t) => t.id !== id),
  }
  saveData(next)
  return next
}
