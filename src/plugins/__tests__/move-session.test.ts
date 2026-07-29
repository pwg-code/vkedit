import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { useTransformOverlay } from '@/hooks/use-transform-overlay'
import { BatchCommand } from '@/commands'
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

function canGroupMove(els: IGraphicElement[]): boolean {
  if (els.length === 0) return false
  return els.every((e) => e.draggable !== false && !e.locked)
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

function startMoveSessionViaPointerDown(el: IGraphicElement, pointerPos = { x: 50, y: 50 }): void {
  hook.selectedElements.value = [el]
  triggerPointerDown(pointerPos)
}

describe('canGroupMove', () => {
  it('returns false for empty array', () => {
    expect(canGroupMove([])).toBe(false)
  })

  it('returns false when element is locked', () => {
    const el = createElement('el-1', { locked: true })
    expect(canGroupMove([el])).toBe(false)
  })

  it('returns false when element is not draggable', () => {
    const el = createElement('el-1', { draggable: false })
    expect(canGroupMove([el])).toBe(false)
  })

  it('returns false when any element in group is locked', () => {
    const el1 = createElement('el-1')
    const el2 = createElement('el-2', { locked: true })
    expect(canGroupMove([el1, el2])).toBe(false)
  })

  it('returns true when all elements can move', () => {
    const el1 = createElement('el-1')
    const el2 = createElement('el-2')
    expect(canGroupMove([el1, el2])).toBe(true)
  })

  it('returns true for draggable and unlocked element', () => {
    const el = createElement('el-1')
    expect(canGroupMove([el])).toBe(true)
  })
})

describe('locked / draggable===false elements', () => {
  it('does not start move session for locked element', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1', { locked: true })
    startMoveSessionViaPointerDown(el)
    expect(emitSpy).not.toHaveBeenCalledWith('element:dragstart', expect.anything())
  })

  it('does not start move session for non-draggable element', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1', { draggable: false })
    startMoveSessionViaPointerDown(el)
    expect(emitSpy).not.toHaveBeenCalledWith('element:dragstart', expect.anything())
  })

  it('does not start move session when group contains a locked element', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el1 = createElement('el-1')
    const el2 = createElement('el-2', { locked: true })
    hook.selectedElements.value = [el1, el2]
    triggerPointerDown({ x: 50, y: 50 })
    expect(emitSpy).not.toHaveBeenCalledWith('element:dragstart', expect.anything())
  })

  it('does not start move session when group contains a non-draggable element', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el1 = createElement('el-1')
    const el2 = createElement('el-2', { draggable: false })
    hook.selectedElements.value = [el1, el2]
    triggerPointerDown({ x: 50, y: 50 })
    expect(emitSpy).not.toHaveBeenCalledWith('element:dragstart', expect.anything())
  })
})

describe('element:dragstart / dragmove / dragend events', () => {
  it('emits element:dragstart with correct payload on move session start', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    expect(emitSpy).toHaveBeenCalledTimes(1)
    expect(emitSpy).toHaveBeenCalledWith(
      'element:dragstart',
      expect.objectContaining({
        element: el,
        elementId: 'el-1',
        source: 'transform-overlay',
      }),
    )
  })

  it('emits element:dragstart target is null when no Konva node', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    expect(emitSpy).toHaveBeenCalledWith(
      'element:dragstart',
      expect.objectContaining({ target: null }),
    )
  })

  it('emits element:dragmove with correct payload during drag', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    emitSpy.mockClear()
    triggerMouseMove({ x: 70, y: 80 })
    expect(emitSpy).toHaveBeenCalledTimes(1)
    expect(emitSpy).toHaveBeenCalledWith(
      'element:dragmove',
      expect.objectContaining({
        element: el,
        elementId: 'el-1',
        source: 'transform-overlay',
      }),
    )
  })

  it('emits element:dragmove with the mouse event', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    emitSpy.mockClear()
    triggerMouseMove({ x: 70, y: 80 })
    const call = emitSpy.mock.calls.find(([name]) => name === 'element:dragmove')
    expect(call).toBeDefined()
    expect(call![1]).toHaveProperty('evt')
    expect(call![1].evt).toBeInstanceOf(MouseEvent)
  })

  it('emits element:dragend with correct payload on mouse up', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseMove({ x: 70, y: 80 })
    emitSpy.mockClear()
    triggerMouseUp()
    expect(emitSpy).toHaveBeenCalledWith(
      'element:dragend',
      expect.objectContaining({
        element: el,
        elementId: 'el-1',
        source: 'transform-overlay',
      }),
    )
  })

  it('emits dragmove before dragend', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    emitSpy.mockClear()
    triggerMouseMove({ x: 70, y: 80 })
    triggerMouseUp()
    const names = emitSpy.mock.calls.map(([n]) => n)
    const dragMoveIdx = names.indexOf('element:dragmove')
    const dragEndIdx = names.indexOf('element:dragend')
    expect(dragMoveIdx).toBeGreaterThanOrEqual(0)
    expect(dragEndIdx).toBeGreaterThan(dragMoveIdx)
  })
})

describe('Alt clone path', () => {
  it('restores original positions when altKey is true on mouseup', () => {
    ;(host as any).plugins.set('clipboard-plugin', { cloneElementsAt: vi.fn() })
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseMove({ x: 80, y: 90 })
    expect(el.x).toBe(30)
    expect(el.y).toBe(40)
    triggerMouseUp(true)
    expect(el.x).toBe(0)
    expect(el.y).toBe(0)
  })

  it('calls clipboard.cloneElementsAt when altKey is true', () => {
    const cloneElementsAt = vi.fn().mockReturnValue([])
    const clipboardPlugin = { cloneElementsAt }
    ;(host as any).plugins.set('clipboard-plugin', clipboardPlugin)
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseMove({ x: 80, y: 90 })
    triggerMouseUp(true)
    expect(cloneElementsAt).toHaveBeenCalledTimes(1)
    expect(cloneElementsAt).toHaveBeenCalledWith([el], expect.objectContaining({
      x: expect.any(Number),
      y: expect.any(Number),
    }))
  })

  it('does not execute command on alt clone path', () => {
    const executeSpy = vi.spyOn(host, 'executeCommand')
    const cloneElementsAt = vi.fn().mockReturnValue([])
    ;(host as any).plugins.set('clipboard-plugin', { cloneElementsAt })
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseMove({ x: 80, y: 90 })
    triggerMouseUp(true)
    expect(executeSpy).not.toHaveBeenCalled()
  })
})

describe('multi-select batch command', () => {
  it('executes BatchCommand when multiple elements are moved', () => {
    const executeSpy = vi.spyOn(host, 'executeCommand')
    const el1 = createElement('el-1')
    const el2 = createElement('el-2')
    hook.selectedElements.value = [el1, el2]
    triggerPointerDown({ x: 50, y: 50 })
    triggerMouseMove({ x: 100, y: 120 })
    triggerMouseUp()
    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy.mock.calls[0][0]).toBeInstanceOf(BatchCommand)
  })

  it('moves all selected elements', () => {
    const el1 = createElement('el-1')
    const el2 = createElement('el-2')
    hook.selectedElements.value = [el1, el2]
    triggerPointerDown({ x: 50, y: 50 })
    triggerMouseMove({ x: 100, y: 120 })
    expect(el1.x).toBe(50)
    expect(el1.y).toBe(70)
    expect(el2.x).toBe(50)
    expect(el2.y).toBe(70)
  })
})

describe('no command when dragged back', () => {
  it('does not execute command when element has not moved', () => {
    const executeSpy = vi.spyOn(host, 'executeCommand')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseUp()
    expect(executeSpy).not.toHaveBeenCalled()
  })

  it('does not execute command when element returns to start position', () => {
    const executeSpy = vi.spyOn(host, 'executeCommand')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    triggerMouseMove({ x: 80, y: 90 })
    triggerMouseMove({ x: 50, y: 50 })
    triggerMouseUp()
    expect(executeSpy).not.toHaveBeenCalled()
  })

  it('still emits dragend when no command is executed', () => {
    const emitSpy = vi.spyOn(host, 'emit')
    const el = createElement('el-1')
    startMoveSessionViaPointerDown(el)
    emitSpy.mockClear()
    triggerMouseUp()
    expect(emitSpy).toHaveBeenCalledWith('element:dragend', expect.anything())
  })
})
