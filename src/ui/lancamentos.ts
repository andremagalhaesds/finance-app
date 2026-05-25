import { categoriesFor, defaultCategory } from '../categories'
import {
  balance,
  currentMonthKey,
  formatMoney,
  formatMonthLabel,
  monthlyFixedTotals,
  recurrenceLabel,
  sumByType,
  sumByTypeForMonth,
} from '../finance'
import type { AppData, Recurrence, Transaction, TransactionType } from '../types'
import { escapeHtml, inputClass, renderShell, today } from './shared'

const renderCategoryOptions = (type: TransactionType): string =>
  categoriesFor(type)
    .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
    .join('')

const renderEntryForm = (type: TransactionType): string => {
  const isIncome = type === 'income'
  const formId = isIncome ? 'income-form' : 'expense-form'
  const label = isIncome ? 'Novo recebimento' : 'Novo gasto'
  const btn = isIncome ? 'Adicionar recebimento' : 'Adicionar gasto'
  const fixedPeer = isIncome
    ? 'peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-300'
    : 'peer-checked:border-rose-500 peer-checked:bg-rose-500/10 peer-checked:text-rose-300'

  return `
    <section class="rounded-2xl border ${isIncome ? 'border-emerald-900/50' : 'border-rose-900/50'} bg-slate-900/50 p-6">
      <h2 class="text-lg font-semibold ${isIncome ? 'text-emerald-300' : 'text-rose-300'} mb-4">${label}</h2>
      <form id="${formId}" class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2 flex gap-2">
          <label class="flex-1">
            <input type="radio" name="recurrence" value="fixed" class="peer sr-only" />
            <span class="flex justify-center py-2 rounded-lg border border-slate-700 cursor-pointer ${fixedPeer} text-slate-400 text-sm transition">Fixo (mensal)</span>
          </label>
          <label class="flex-1">
            <input type="radio" name="recurrence" value="variable" checked class="peer sr-only" />
            <span class="flex justify-center py-2 rounded-lg border border-slate-700 cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-300 text-slate-400 text-sm transition">Variável</span>
          </label>
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Valor (R$)</label>
          <input name="amount" type="number" min="0.01" step="0.01" required class="${inputClass}" placeholder="0,00" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Data</label>
          <input name="date" type="date" required value="${today()}" class="${inputClass}" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Categoria</label>
          <select name="category" required class="${inputClass}">
            ${renderCategoryOptions(type)}
          </select>
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Descrição</label>
          <input name="description" type="text" required maxlength="120" class="${inputClass}"
            placeholder="${isIncome ? 'Ex.: salário CLT' : 'Ex.: supermercado'}" />
        </div>
        <div class="sm:col-span-2">
          <button type="submit"
            class="w-full py-2.5 rounded-lg ${isIncome ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} text-white font-medium transition">
            ${btn}
          </button>
        </div>
      </form>
    </section>
  `
}

const renderTransactionTable = (
  transactions: Transaction[],
  type: TransactionType,
): string => {
  const isIncome = type === 'income'
  const sorted = transactions
    .filter((t) => t.type === type)
    .sort((a, b) => b.date.localeCompare(a.date))

  const total = sumByType(sorted, type)
  const fixedTotal = sumByType(sorted, type, 'fixed')
  const monthKey = currentMonthKey()
  const variableTotal = sumByTypeForMonth(sorted, type, monthKey, 'variable')
  const title = isIncome ? 'Recebimentos' : 'Gastos'
  const empty = isIncome
    ? 'Nenhum recebimento cadastrado.'
    : 'Nenhum gasto cadastrado.'

  if (sorted.length === 0) {
    return `
      <section class="rounded-2xl border ${isIncome ? 'border-emerald-900/40' : 'border-rose-900/40'} bg-slate-900/50 p-6">
        <h2 class="text-lg font-semibold ${isIncome ? 'text-emerald-300' : 'text-rose-300'} mb-2">${title}</h2>
        <p class="text-sm text-slate-500">${empty}</p>
      </section>
    `
  }

  return `
    <section class="rounded-2xl border ${isIncome ? 'border-emerald-900/40' : 'border-rose-900/40'} bg-slate-900/50 p-6">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 class="text-lg font-semibold ${isIncome ? 'text-emerald-300' : 'text-rose-300'}">${title}</h2>
          <p class="text-2xl font-bold tabular-nums mt-1 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
            ${isIncome ? '+' : '−'}${formatMoney(total)}
          </p>
        </div>
        <div class="text-xs text-slate-500 space-y-1 text-right">
          <p>Fixos (soma lançada): <span class="${isIncome ? 'text-emerald-400' : 'text-rose-400'} font-medium">${formatMoney(fixedTotal)}</span></p>
          <p>Variável em ${formatMonthLabel(monthKey)}: <span class="text-slate-300 font-medium">${formatMoney(variableTotal)}</span></p>
        </div>
      </div>
      <div class="overflow-x-auto rounded-lg border border-slate-800">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-800/60 text-slate-400">
            <tr>
              <th class="px-3 py-2 font-medium">Data</th>
              <th class="px-3 py-2 font-medium">Descrição</th>
              <th class="px-3 py-2 font-medium">Categoria</th>
              <th class="px-3 py-2 font-medium">Tipo</th>
              <th class="px-3 py-2 font-medium text-right">Valor</th>
              <th class="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${sorted
              .map(
                (t) => `
              <tr class="hover:bg-slate-800/30">
                <td class="px-3 py-2 text-slate-400 whitespace-nowrap">
                  ${new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td class="px-3 py-2 text-slate-200">${escapeHtml(t.description)}</td>
                <td class="px-3 py-2 text-slate-400">${escapeHtml(t.category)}</td>
                <td class="px-3 py-2">
                  <span class="inline-block px-2 py-0.5 rounded text-xs ${
                    t.recurrence === 'fixed'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-700 text-slate-400'
                  }">${recurrenceLabel(t.recurrence)}</span>
                </td>
                <td class="px-3 py-2 text-right font-medium tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}">
                  ${formatMoney(t.amount)}
                </td>
                <td class="px-3 py-2 text-center">
                  <button type="button" data-delete="${t.id}"
                    class="text-slate-500 hover:text-rose-400 transition" title="Remover">✕</button>
                </td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `
}

export const renderLancamentosPage = (data: AppData): string => {
  const total = balance(data.transactions)
  const fixed = monthlyFixedTotals(data.transactions)

  const content = `
    <header class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Lançamentos</h1>
      <p class="text-slate-400 text-sm">Cadastre recebimentos e gastos, com categorias e tipo fixo ou variável.</p>
    </header>

    <section class="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 mb-8 shadow-xl">
      <p class="text-slate-400 text-sm mb-1">Saldo atual</p>
      <p class="text-4xl font-bold tabular-nums ${total >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
        ${formatMoney(total)}
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
        <div class="rounded-lg bg-slate-800/50 p-3">
          <p class="text-slate-500">Receitas</p>
          <p class="text-emerald-400 font-semibold tabular-nums">${formatMoney(sumByType(data.transactions, 'income'))}</p>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-3">
          <p class="text-slate-500">Gastos</p>
          <p class="text-rose-400 font-semibold tabular-nums">${formatMoney(sumByType(data.transactions, 'expense'))}</p>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-3">
          <p class="text-slate-500">Fixos/mês (rec.)</p>
          <p class="text-emerald-300 font-semibold tabular-nums">${formatMoney(fixed.income)}</p>
        </div>
        <div class="rounded-lg bg-slate-800/50 p-3">
          <p class="text-slate-500">Fixos/mês (gast.)</p>
          <p class="text-rose-300 font-semibold tabular-nums">${formatMoney(fixed.expense)}</p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2 mb-8">
      ${renderEntryForm('income')}
      ${renderEntryForm('expense')}
    </div>

    <div class="grid gap-6">
      ${renderTransactionTable(data.transactions, 'income')}
      ${renderTransactionTable(data.transactions, 'expense')}
    </div>
  `

  return renderShell('lancamentos', content)
}

export const bindLancamentosEvents = (
  root: HTMLElement,
  onAdd: (tx: Transaction) => void,
  onDelete: (id: string) => void,
): void => {
  const bindForm = (formId: string, type: TransactionType): void => {
    const form = root.querySelector<HTMLFormElement>(`#${formId}`)
    form?.addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      const amount = Number(fd.get('amount'))
      const date = String(fd.get('date'))
      const description = String(fd.get('description')).trim()
      const category = String(fd.get('category') || defaultCategory(type))
      const recurrence = (fd.get('recurrence') as Recurrence) || 'variable'

      if (!amount || amount <= 0 || !description) return

      onAdd({
        id: crypto.randomUUID(),
        type,
        amount,
        description,
        date,
        category,
        recurrence,
      })
    })
  }

  bindForm('income-form', 'income')
  bindForm('expense-form', 'expense')

  root.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete')
      if (id) onDelete(id)
    })
  })
}
