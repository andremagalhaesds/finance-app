import type { TransactionType } from './types'

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Presente / reembolso',
  'Outros recebimentos',
] as const

export const EXPENSE_CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Contas e serviços',
  'Compras',
  'Outros gastos',
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const categoriesFor = (type: TransactionType): readonly string[] =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

export const defaultCategory = (type: TransactionType): string =>
  type === 'income' ? 'Outros recebimentos' : 'Outros gastos'
