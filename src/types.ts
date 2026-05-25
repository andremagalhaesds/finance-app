export type TransactionType = 'income' | 'expense'
export type Recurrence = 'fixed' | 'variable'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  category: string
  recurrence: Recurrence
}

export interface MonthSummary {
  month: string
  income: number
  expense: number
  fixedIncome: number
  fixedExpense: number
  variableIncome: number
  variableExpense: number
  balance: number
}

export interface ProjectionMonth {
  month: string
  label: string
  projectedIncome: number
  projectedExpense: number
  projectedFixedIncome: number
  projectedFixedExpense: number
  projectedVariableIncome: number
  projectedVariableExpense: number
  projectedBalance: number
}

export interface ProjectionBasis {
  monthlyFixedIncome: number
  monthlyFixedExpense: number
  scheduledVariableCount: number
}

export interface AppData {
  transactions: Transaction[]
}
