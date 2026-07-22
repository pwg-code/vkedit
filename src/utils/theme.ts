export type VkeditTheme = 'dark' | 'light'

export function resolveVkeditTheme(el: Element | null | undefined): VkeditTheme {
  if (!el || typeof el.closest !== 'function') return 'dark'
  const host = el.closest('[data-vkedit-theme]')
  const value = host?.getAttribute('data-vkedit-theme')
  return value === 'light' ? 'light' : 'dark'
}
