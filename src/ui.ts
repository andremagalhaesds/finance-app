import { getPageFromHash, navigate, onRouteChange, type Page } from './router'
import { addTransaction, loadData, removeTransaction } from './storage'
import type { AppData, Transaction } from './types'
import { bindLancamentosEvents, renderLancamentosPage } from './ui/lancamentos'
import {
  bindProjecaoEvents,
  renderProjecaoPage,
  type ProjecaoState,
} from './ui/projecao'

let data: AppData = loadData()
let page: Page = getPageFromHash()
let projecaoState: ProjecaoState = {
  months: 6,
  typeFilter: 'all',
  categoryFilter: 'all',
}

const app = document.querySelector<HTMLDivElement>('#app')!

const render = (): void => {
  if (page === 'lancamentos') {
    app.innerHTML = renderLancamentosPage(data)
    bindLancamentosEvents(
      app,
      (tx) => {
        data = addTransaction(data, tx as Transaction)
        render()
      },
      (id) => {
        data = removeTransaction(data, id)
        render()
      },
    )
  } else {
    app.innerHTML = renderProjecaoPage(data, projecaoState)
    bindProjecaoEvents(app, projecaoState, (patch) => {
      projecaoState = { ...projecaoState, ...patch }
      render()
    })
  }
}

export const initApp = (): void => {
  if (!location.hash) navigate('lancamentos')

  onRouteChange(() => {
    page = getPageFromHash()
    render()
  })

  page = getPageFromHash()
  render()
}
