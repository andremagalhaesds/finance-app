import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories'
import type { Transaction, TransactionType } from './types'

export type TypeFilter = 'all' | TransactionType

export const filterTransactions = (
  transactions: Transaction[],
  typeFilter: TypeFilter,
  categoryFilter: string,
): Transaction[] =>
  transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    return true
  })

export const categoriesForFilter = (typeFilter: TypeFilter): string[] => {
  if (typeFilter === 'income') return [...INCOME_CATEGORIES]
  if (typeFilter === 'expense') return [...EXPENSE_CATEGORIES]
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
}

export const filterLabel = (
  typeFilter: TypeFilter,
  categoryFilter: string,
): string => {
  const parts: string[] = []
  if (typeFilter === 'income') parts.push('Recebimentos')
  else if (typeFilter === 'expense') parts.push('Gastos')
  if (categoryFilter !== 'all') parts.push(categoryFilter)
  return parts.length === 0 ? 'Todas as categorias' : parts.join(' · ')
}

export const isValidCategoryForFilter = (
  typeFilter: TypeFilter,
  category: string,
): boolean => category === 'all' || categoriesForFilter(typeFilter).includes(category)
