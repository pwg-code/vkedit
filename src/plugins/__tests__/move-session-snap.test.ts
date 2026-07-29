import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { useTransformOverlay } from '@/hooks/use-transform-overlay'
import type { IGraphicElement } from '@/types/base'

vi.mock('@/core', () => ({}))
vi.mock('@/utils/transform-geometry', () => ({
  getElementOBBFromSource: vi.fn(() => ({
    corners: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ],
    width: 10,
    height: 10,
    rotation: 0,
    centerX: 5,
    centerY: 5,
  })),
  obbToViewport: vi.fn((obb: any) => obb),
  getSelectionUnionRect: vi.fn(() => ({ x: 0, y: 0, width: 10, height: 10 })),
  rectToViewport: vi.fn((r: any) => r),
  viewportToContent: vi.fn((_x: number, _y: number) => ({ x: _x, y: _y })),
  formatRotationLabel: vi.fn(() => ''),
}))
vi.mock('@/utils/transform-overlay', () => {
  const hitTestTransformOverlay = vi.fn((_pointer: any, params: any) => {
    if (params.canMove === false) return { type: 'none' }
    return { type: 'move' }
  })
  return {
    TRANSFORM_OVERLAY_CONSTANTS: {
      ANCHOR_SIZE: 8,
      ROTATE_HANDLE_RADIUS: 12,
      BORDER_STROKE_WIDTH: 1,
      MIN_SIZE_PX: 5,
      ANGLE_LABEL_OFFSET_X: 20,
      ANGLE_LABEL_OFFSET_Y: -30,
    },
    layoutAnchors: vi.fn(() => []),
    layoutRotateHandle: vi.fn(() => ({ x: 0, y: 0 })),
    resolveEnabledAnchors: vi.fn(() => null),
    resolveShowRotate: vi.fn(() => false),
    hitTestTransformOverlay,
    cursorForHitZone: vi.fn(() => 'default'),
  }
})

function createElement(id: string, overrides: Partial<IGraphicElement> = {}): IGraphicElement {
  return {
    id,
    type: 'test',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    locked: false,
    draggable: true,
    resizable: true,
    zIndex: 0,
    displayName: null,
    getBoundingBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    clone: function clone() {
      return createElement(id + '_copy', overrides)
    },
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
    ...overrides,
  }
}

let host: EditorHost
let hook: ReturnType<typeof useTransformOverlay>

beforeEach(() => {
  host = new EditorHost()
  host.stage = { getPointerPosition: vi.fn() }
  hook = useTransformOverlay(host)
})

afterEach(() => {
  window.dispatchEvent(new MouseEvent('mouseup'))
  vi.clearAllMocks()
})

function triggerPointerDown(pos: { x: number; y: number }): void {
  const mockGetPointerPosition = vi.fn(() => pos)
  ;(host.stage as any).getPointerPosition = mockGetPointerPosition
  const e = {
    target: { getStage: () => host.stage },
    cancelBubble: false,
  }
  hook.onOverlayPointerDown(e)
}

function triggerMouseMove(pos: { x: number; y: number }): void {
  const mockGetPointerPosition = vi.fn(() => pos)
  ;(host.stage as any).getPointerPosition = mockGetPointerPosition
  window.dispatchEvent(new MouseEvent('mousemove'))
}

function triggerMouseUp(altKey = false): void {
  window.dispatchEvent(new MouseEvent('mouseup', { altKey }))
}

describe('move session with snap plugin', () => {
  it('writes intent + resolveDragSnap offset to element', () => {
    const resolveDragSnap = vi.fn(() => ({ offsetX: 3, offsetY: 0 }))
    ;(host as any).plugins.set('snap-plugin', { resolveDragSnap })

    const el = createElement('el-1')
    hook.selectedElements.value = [el]
    triggerPointerDown({ x: 0, y: 0 })
    triggerMouseMove({ x: 97, y: 0 })

    expect(resolveDragSnap).toHaveBeenCalled()
    expect(el.x).toBe(100)
    expect(el.y).toBe(0)
  })

  it('emits dragmove after snap offset applied', () => {
    const resolveDragSnap = vi.fn(() => ({ offsetX: 3, offsetY: 0 }))
    ;(host as any).plugins.set('snap-plugin', { resolveDragSnap })

    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    hook.selectedElements.value = [el]
    triggerPointerDown({ x: 0, y: 0 })
    emitSpy.mockClear()
    triggerMouseMove({ x: 97, y: 0 })

    expect(emitSpy).toHaveBeenCalledWith(
      'element:dragmove',
      expect.objectContaining({
        element: el,
        elementId: 'el-1',
        source: 'transform-overlay',
      }),
    )
  })

  it('applies zero offset when snap plugin not installed', () => {
    const el = createElement('el-1')
    hook.selectedElements.value = [el]
    triggerPointerDown({ x: 0, y: 0 })
    triggerMouseMove({ x: 97, y: 0 })
    expect(el.x).toBe(97)
    expect(el.y).toBe(0)
  })
})
