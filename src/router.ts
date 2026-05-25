export type Page = 'lancamentos' | 'projecao'

export const pagePath = (page: Page): string =>
  page === 'lancamentos' ? '#/lancamentos' : '#/projecao'

export const getPageFromHash = (): Page => {
  const hash = location.hash.replace(/^#\/?/, '')
  if (hash.startsWith('projecao')) return 'projecao'
  return 'lancamentos'
}

export const navigate = (page: Page): void => {
  const path = pagePath(page)
  if (location.hash !== path) location.hash = path
}

export const onRouteChange = (handler: () => void): void => {
  window.addEventListener('hashchange', handler)
}
