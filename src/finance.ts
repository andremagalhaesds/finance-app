import type {
  MonthSummary,
  ProjectionBasis,
  ProjectionMonth,
  Recurrence,
  Transaction,
  TransactionType,
} from './types'

export const formatMoney = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

export const formatMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

export const recurrenceLabel = (r: Recurrence): string =>
  r === 'fixed' ? 'Fixo' : 'Variável'

export const currentMonthKey = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const balance = (transactions: Transaction[]): number =>
  transactions.reduce(
    (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
    0,
  )

export const sumByType = (
  transactions: Transaction[],
  type: TransactionType,
  recurrence?: Recurrence,
): number =>
  transactions
    .filter(
      (t) =>
        t.type === type && (recurrence === undefined || t.recurrence === recurrence),
    )
    .reduce((sum, t) => sum + t.amount, 0)

export const sumByTypeForMonth = (
  transactions: Transaction[],
  type: TransactionType,
  monthKey: string,
  recurrence?: Recurrence,
): number =>
  transactions
    .filter(
      (t) =>
        t.type === type &&
        monthKeyFromDate(t.date) === monthKey &&
        (recurrence === undefined || t.recurrence === recurrence),
    )
    .reduce((sum, t) => sum + t.amount, 0)

export const monthKeyFromDate = (date: string): string => date.slice(0, 7)

const fixedItemKey = (t: Transaction): string =>
  `${t.type}|${t.category}|${t.description.toLowerCase().trim()}`

/** Valor mensal de cada item fixo (usa o lançamento mais recente). */
export const monthlyFixedTotals = (
  transactions: Transaction[],
): { income: number; expense: number } => {
  const latest = new Map<string, Transaction>()

  for (const t of transactions.filter((x) => x.recurrence === 'fixed')) {
    const key = fixedItemKey(t)
    const existing = latest.get(key)
    if (!existing || t.date > existing.date) latest.set(key, t)
  }

  let income = 0
  let expense = 0
  for (const t of latest.values()) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense }
}

/** Variáveis contam só no mês da data informada. */
export const variableTotalsForMonth = (
  transactions: Transaction[],
  monthKey: string,
): { income: number; expense: number } => {
  let income = 0
  let expense = 0

  for (const t of transactions) {
    if (t.recurrence !== 'variable') continue
    if (monthKeyFromDate(t.date) !== monthKey) continue
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }

  return { income, expense }
}

export const monthlySummaries = (
  transactions: Transaction[],
): MonthSummary[] => {
  const map = new Map<
    string,
    {
      income: number
      expense: number
      fixedIncome: number
      fixedExpense: number
      variableIncome: number
      variableExpense: number
    }
  >()

  for (const t of transactions) {
    const key = monthKeyFromDate(t.date)
    const entry = map.get(key) ?? {
      income: 0,
      expense: 0,
      fixedIncome: 0,
      fixedExpense: 0,
      variableIncome: 0,
      variableExpense: 0,
    }

    if (t.type === 'income') {
      entry.income += t.amount
      if (t.recurrence === 'fixed') entry.fixedIncome += t.amount
      else entry.variableIncome += t.amount
    } else {
      entry.expense += t.amount
      if (t.recurrence === 'fixed') entry.fixedExpense += t.amount
      else entry.variableExpense += t.amount
    }

    map.set(key, entry)
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, e]) => ({
      month,
      income: e.income,
      expense: e.expense,
      fixedIncome: e.fixedIncome,
      fixedExpense: e.fixedExpense,
      variableIncome: e.variableIncome,
      variableExpense: e.variableExpense,
      balance: e.income - e.expense,
    }))
}

const addMonths = (monthKey: string, count: number): string => {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + count, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const projectionBasis = (
  transactions: Transaction[],
): ProjectionBasis => {
  const fixed = monthlyFixedTotals(transactions)
  const start = currentMonthKey()
  let scheduledVariableCount = 0

  for (let i = 1; i <= 12; i++) {
    const month = addMonths(start, i)
    scheduledVariableCount += transactions.filter(
      (t) => t.recurrence === 'variable' && monthKeyFromDate(t.date) === month,
    ).length
  }

  return {
    monthlyFixedIncome: fixed.income,
    monthlyFixedExpense: fixed.expense,
    scheduledVariableCount,
  }
}

export const buildProjection = (
  transactions: Transaction[],
  monthsAhead: 6 | 12,
): ProjectionMonth[] => {
  const fixed = monthlyFixedTotals(transactions)
  let runningBalance = balance(transactions)
  const start = currentMonthKey()
  const result: ProjectionMonth[] = []

  for (let i = 1; i <= monthsAhead; i++) {
    const month = addMonths(start, i)
    const variable = variableTotalsForMonth(transactions, month)
    const projectedIncome = fixed.income + variable.income
    const projectedExpense = fixed.expense + variable.expense

    runningBalance += projectedIncome - projectedExpense

    result.push({
      month,
      label: formatMonthLabel(month),
      projectedIncome,
      projectedExpense,
      projectedFixedIncome: fixed.income,
      projectedFixedExpense: fixed.expense,
      projectedVariableIncome: variable.income,
      projectedVariableExpense: variable.expense,
      projectedBalance: runningBalance,
    })
  }

  return result
}

export const hasProjectionData = (transactions: Transaction[]): boolean => {
  const fixed = monthlyFixedTotals(transactions)
  if (fixed.income > 0 || fixed.expense > 0) return true

  const start = currentMonthKey()
  for (let i = 1; i <= 12; i++) {
    const v = variableTotalsForMonth(transactions, addMonths(start, i))
    if (v.income > 0 || v.expense > 0) return true
  }
  return false
}
