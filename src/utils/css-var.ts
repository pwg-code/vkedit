/** Resolve the editor theme host (semantic tokens live here, not always on :root). */
function resolveThemeScope(el?: Element | null): Element {
  if (typeof document === 'undefined') {
    throw new Error('cssVar requires a DOM environment')
  }
  if (el && typeof el.closest === 'function') {
    const host = el.closest('.vkedit-editor, [data-vkedit-theme]')
    if (host) return host
  }
  return (
    document.querySelector('.vkedit-editor, [data-vkedit-theme]') ?? document.documentElement
  )
}

/**
 * Read a CSS custom property from the editor theme scope.
 * Prefer passing a node inside the editor (e.g. host.stageState.wrapperEl).
 */
export function cssVar(name: string, el?: Element | null): string {
  return getComputedStyle(resolveThemeScope(el)).getPropertyValue(name).trim()
}

/**
 * Resolve a color token to a computed color (rgb/rgba) that canvas/Konva can use.
 * getPropertyValue alone may return nested `var(...)` which Konva cannot paint.
 */
export function cssColorVar(name: string, el?: Element | null): string {
  const scope = resolveThemeScope(el)
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  scope.appendChild(probe)
  const color = getComputedStyle(probe).color
  scope.removeChild(probe)
  return color
}

/**
 * Resolve color-mix against a token (e.g. primary @ 16% transparent) for Konva fills.
 */
export function cssColorMix(
  name: string,
  percent: number,
  el?: Element | null,
  space = 'oklab',
): string {
  const scope = resolveThemeScope(el)
  const probe = document.createElement('span')
  probe.style.color = `color-mix(in ${space}, var(${name}) ${percent}%, transparent)`
  scope.appendChild(probe)
  const color = getComputedStyle(probe).color
  scope.removeChild(probe)
  return color
}
