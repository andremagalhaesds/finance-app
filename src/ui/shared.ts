import { pagePath, type Page } from '../router'

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const today = (): string => new Date().toISOString().slice(0, 10)

export const inputClass =
  'w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

export const renderShell = (
  activePage: Page,
  content: string,
): string => `
  <div class="min-h-screen bg-slate-950 text-slate-200">
    <nav class="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div class="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4 h-14">
        <a href="${pagePath('lancamentos')}" class="font-semibold text-white text-sm sm:text-base hover:text-indigo-300 transition">
          Minhas finanças
        </a>
        <div class="flex gap-1 rounded-lg bg-slate-800/80 p-1">
          <a href="${pagePath('lancamentos')}"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activePage === 'lancamentos'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }">
            Lançamentos
          </a>
          <a href="${pagePath('projecao')}"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition ${
              activePage === 'projecao'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }">
            Projeção
          </a>
        </div>
      </div>
    </nav>
    <main class="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      ${content}
    </main>
  </div>
`
