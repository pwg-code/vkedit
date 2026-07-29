import { describe, expect, it, beforeEach, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { SnapPlugin } from '@/plugins/snap/snap'
import type { IGraphicElement } from '@/types/base'

vi.mock('@/core', () => ({}))

function createEl(id: string, x: number, y: number, w = 10, h = 10): IGraphicElement {
  return {
    id,
    type: 'test',
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    locked: false,
    draggable: true,
    resizable: true,
    zIndex: 0,
    displayName: null,
    getBoundingBox: () => ({ x, y, width: w, height: h }),
    clone: () => createEl(id + '_c', x, y, w, h),
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
  }
}

describe('SnapPlugin.resolveDragSnap', () => {
  let host: EditorHost
  let snap: SnapPlugin
  let target: IGraphicElement
  let dragged: IGraphicElement

  beforeEach(() => {
    host = new EditorHost()
    host.status.snapToGrid = true
    host.status.zoom = 1

    target = createEl('t', 100, 0)
    dragged = createEl('d', 0, 0)

    const elements = new Map<string, IGraphicElement>()
    elements.set('t', target)
    elements.set('d', dragged)

    host.installPlugin('snap-plugin', SnapPlugin)
    snap = host.getPlugin('snap-plugin') as SnapPlugin

    vi.spyOn(host, 'getPlugin').mockImplementation((name: string) => {
      if (name === 'snap-plugin') return snap
      if (name === 'graphic-registry-plugin') {
        return {
          elements: {
            forEach: (fn: (e: IGraphicElement) => void) => elements.forEach(fn),
          },
        }
      }
      if (name === 'selection-plugin') {
        return { getSelectionElements: () => [dragged] }
      }
      throw new Error(`不存在插件: ${name}`)
    })

    host.emit('element:dragstart', {
      element: dragged,
      elementId: dragged.id,
      target: null,
      evt: undefined,
      source: 'test',
      timestamp: Date.now(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns non-zero offset when intent is near a target edge', () => {
    const intent = new Map([['d', { x: 97, y: 0 }]])
    const { offsetX, offsetY } = snap.resolveDragSnap([dragged], intent)
    expect(offsetX).not.toBe(0)
    expect(offsetY).toBe(0)
    expect(snap.guideLines.value.length).toBeGreaterThan(0)
  })

  it('snaps left edge to target left edge when that is the closest pair', () => {
    const t2 = createEl('t', 100, 0, 50)
    const d2 = createEl('d', 0, 0, 10)
    const elements = new Map<string, IGraphicElement>()
    elements.set('t', t2)
    elements.set('d', d2)
    host.emit('element:dragend', {
      element: d2, elementId: d2.id, target: null, evt: undefined, source: 'test', timestamp: Date.now(),
    })
    vi.spyOn(host, 'getPlugin').mockImplementation((name: string) => {
      if (name === 'snap-plugin') return snap
      if (name === 'graphic-registry-plugin') {
        return { elements: { forEach: (fn: (e: IGraphicElement) => void) => elements.forEach(fn) } }
      }
      if (name === 'selection-plugin') { return { getSelectionElements: () => [d2] } }
      throw new Error(`不存在插件: ${name}`)
    })
    host.emit('element:dragstart', {
      element: d2, elementId: d2.id, target: null, evt: undefined, source: 'test', timestamp: Date.now(),
    })
    const intent = new Map([['d', { x: 98, y: 0 }]])
    const { offsetX, offsetY } = snap.resolveDragSnap([d2], intent)
    expect(offsetX).toBe(2)
    expect(offsetY).toBe(0)
    expect(snap.guideLines.value.some((g) => g.axis === 'x' && g.value === 100)).toBe(true)
  })

  it('does not mutate element position', () => {
    dragged.x = 97
    const intent = new Map([['d', { x: 97, y: 0 }]])
    snap.resolveDragSnap([dragged], intent)
    expect(dragged.x).toBe(97)
  })

  it('returns zero when snap disabled at dragstart', () => {
    host.status.snapToGrid = false
    host.emit('element:dragend', {
      element: dragged,
      elementId: dragged.id,
      target: null,
      evt: undefined,
      source: 'test',
      timestamp: Date.now(),
    })
    host.emit('element:dragstart', {
      element: dragged,
      elementId: dragged.id,
      target: null,
      evt: undefined,
      source: 'test',
      timestamp: Date.now(),
    })
    const intent = new Map([['d', { x: 97, y: 0 }]])
    expect(snap.resolveDragSnap([dragged], intent)).toEqual({ offsetX: 0, offsetY: 0 })
  })

  it('returns zero when no targets are cached', () => {
    host.emit('element:dragend', {
      element: dragged,
      elementId: dragged.id,
      target: null,
      evt: undefined,
      source: 'test',
      timestamp: Date.now(),
    })
    vi.spyOn(host, 'getPlugin').mockImplementation((name: string) => {
      if (name === 'snap-plugin') return snap
      if (name === 'graphic-registry-plugin') {
        return { elements: { forEach: (_fn: (e: IGraphicElement) => void) => {} } }
      }
      if (name === 'selection-plugin') {
        return { getSelectionElements: () => [dragged] }
      }
      throw new Error(`不存在插件: ${name}`)
    })
    host.emit('element:dragstart', {
      element: dragged,
      elementId: dragged.id,
      target: null,
      evt: undefined,
      source: 'test',
      timestamp: Date.now(),
    })
    const intent = new Map([['d', { x: 97, y: 0 }]])
    expect(snap.resolveDragSnap([dragged], intent)).toEqual({ offsetX: 0, offsetY: 0 })
  })
})
