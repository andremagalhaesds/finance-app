import {
  categoriesForFilter,
  filterLabel,
  filterTransactions,
  type TypeFilter,
} from '../filters'
import {
  balance,
  buildProjection,
  formatMoney,
  hasProjectionData,
  projectionBasis,
} from '../finance'
import type { AppData } from '../types'
import { escapeHtml, renderShell } from './shared'

export interface ProjecaoState {
  months: 6 | 12
  typeFilter: TypeFilter
  categoryFilter: string
}

const renderFilterBar = (state: ProjecaoState): string => {
  const categories = categoriesForFilter(state.typeFilter)
  const categoryOptions = [
    `<option value="all" ${state.categoryFilter === 'all' ? 'selected' : ''}>Todas as categorias</option>`,
    ...categories.map(
      (c) =>
        `<option value="${escapeHtml(c)}" ${state.categoryFilter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`,
    ),
  ].join('')

  const typeBtn = (value: TypeFilter, label: string) => `
    <button type="button" data-type-filter="${value}"
      class="px-3 py-1.5 rounded-md text-sm font-medium transition ${
        state.typeFilter === value
          ? 'bg-indigo-600 text-white'
          : 'text-slate-400 hover:text-white'
      }">${label}</button>
  `

  return `
    <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4 mb-6 space-y-4">
      <h3 class="text-sm font-medium text-slate-300">Filtros</h3>
      <div class="flex flex-wrap gap-2">
        <span class="text-xs text-slate-500 self-center mr-1">Tipo:</span>
        ${typeBtn('all', 'Todos')}
        ${typeBtn('income', 'Recebimentos')}
        ${typeBtn('expense', 'Gastos')}
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-1">Categoria</label>
        <select id="category-filter" class="w-full sm:max-w-xs rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          ${categoryOptions}
        </select>
      </div>
      <p class="text-xs text-slate-500">
        Exibindo: <strong class="text-slate-300">${escapeHtml(filterLabel(state.typeFilter, state.categoryFilter))}</strong>
      </p>
    </div>
  `
}

const renderProjectionTable = (
  data: AppData,
  state: ProjecaoState,
): string => {
  const filtered = filterTransactions(
    data.transactions,
    state.typeFilter,
    state.categoryFilter,
  )
  const basis = projectionBasis(filtered)
  const rows = buildProjection(filtered, state.months)
  const filteredBalance = balance(filtered)
  const hasFilter =
    state.typeFilter !== 'all' || state.categoryFilter !== 'all'

  if (!hasProjectionData(filtered)) {
    return `
      <p class="text-sm text-slate-400 py-4">
        Nenhum lançamento corresponde aos filtros ou não há dados para projetar.
        ${hasFilter ? ' Tente ampliar os filtros.' : ' Cadastre lançamentos na aba Lançamentos.'}
      </p>
    `
  }

  return `
    ${hasFilter ? `
      <p class="text-sm text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
        Projeção parcial: saldo inicial filtrado <strong>${formatMoney(filteredBalance)}</strong>
        (só lançamentos que batem com o filtro).
      </p>
    ` : ''}
    <p class="text-sm text-slate-400 mb-4">
      <strong class="text-slate-300">Fixo</strong> repete em todos os meses
      (receita ${formatMoney(basis.monthlyFixedIncome)} · gasto ${formatMoney(basis.monthlyFixedExpense)}).
      <strong class="text-slate-300">Variável</strong> só no mês da data cadastrada
      ${basis.scheduledVariableCount > 0 ? `(${basis.scheduledVariableCount} na projeção).` : '.'}
    </p>
    <div class="overflow-x-auto rounded-lg border border-slate-800">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-800/60 text-slate-400">
          <tr>
            <th class="px-3 py-2 font-medium">Mês</th>
            <th class="px-3 py-2 font-medium text-right">Rec. fixa</th>
            <th class="px-3 py-2 font-medium text-right">Rec. var.</th>
            <th class="px-3 py-2 font-medium text-right">Gasto fixo</th>
            <th class="px-3 py-2 font-medium text-right">Gasto var.</th>
            <th class="px-3 py-2 font-medium text-right">Saldo acum.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          ${rows
            .map(
              (r) => `
            <tr class="hover:bg-slate-800/30">
              <td class="px-3 py-2 text-slate-200">${escapeHtml(r.label)}</td>
              <td class="px-3 py-2 text-right text-emerald-500/80 tabular-nums text-xs">${formatMoney(r.projectedFixedIncome)}</td>
              <td class="px-3 py-2 text-right text-emerald-400 tabular-nums text-xs">${formatMoney(r.projectedVariableIncome)}</td>
              <td class="px-3 py-2 text-right text-rose-500/80 tabular-nums text-xs">${formatMoney(r.projectedFixedExpense)}</td>
              <td class="px-3 py-2 text-right text-rose-400 tabular-nums text-xs">${formatMoney(r.projectedVariableExpense)}</td>
              <td class="px-3 py-2 text-right font-medium tabular-nums ${r.projectedBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${formatMoney(r.projectedBalance)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
}

export const renderProjecaoPage = (
  data: AppData,
  state: ProjecaoState,
): string => {
  const content = `
    <header class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">Projeção</h1>
      <p class="text-slate-400 text-sm">Próximos ${state.months} meses · filtre por tipo e categoria.</p>
    </header>

    ${renderFilterBar(state)}

    <section class="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-lg font-semibold text-white">Tabela</h2>
        <div class="flex gap-1 rounded-lg bg-slate-800 p-1">
          <button type="button" data-projection="6"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition ${state.months === 6 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}">
            6 meses
          </button>
          <button type="button" data-projection="12"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition ${state.months === 12 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}">
            12 meses
          </button>
        </div>
      </div>
      <p class="text-xs text-slate-500 mb-4">
        <strong class="text-slate-400">Fixo:</strong> repete todo mês.
        <strong class="text-slate-400">Variável:</strong> só no mês da data informada.
      </p>
      ${renderProjectionTable(data, state)}
    </section>
  `

  return renderShell('projecao', content)
}

export const bindProjecaoEvents = (
  root: HTMLElement,
  state: ProjecaoState,
  onChange: (patch: Partial<ProjecaoState>) => void,
): void => {
  root.querySelectorAll('[data-projection]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const months = Number(btn.getAttribute('data-projection')) as 6 | 12
      onChange({ months })
    })
  })

  root.querySelectorAll('[data-type-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const typeFilter = btn.getAttribute('data-type-filter') as TypeFilter
      const patch: Partial<ProjecaoState> = { typeFilter }
      if (
        state.categoryFilter !== 'all' &&
        !categoriesForFilter(typeFilter).includes(state.categoryFilter)
      ) {
        patch.categoryFilter = 'all'
      }
      onChange(patch)
    })
  })

  const categorySelect = root.querySelector<HTMLSelectElement>('#category-filter')
  categorySelect?.addEventListener('change', () => {
    onChange({ categoryFilter: categorySelect.value })
  })
}
