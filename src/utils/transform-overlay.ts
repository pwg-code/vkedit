import type { OBB, Rect2D } from '@/utils/transform-geometry'
import { normalizeDeg } from '@/utils/transform-geometry'
import { DEFAULT_ANCHORS } from '@/types'

export type AnchorId =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right'
  | 'top-center'
  | 'bottom-center'

export type HitZone =
  | { type: 'anchor'; anchor: AnchorId }
  | { type: 'rotate' }
  | { type: 'move' }
  | { type: 'none' }

export const TRANSFORM_OVERLAY_CONSTANTS = {
  ANCHOR_SIZE: 8,
  ANCHOR_HIT_SIZE: 14,
  EDGE_HIT_WIDTH: 8,
  ROTATE_HANDLE_RADIUS: 5,
  ROTATE_HANDLE_HIT_RADIUS: 16,
  ROTATE_HANDLE_OFFSET: 22,
  BORDER_STROKE_WIDTH: 1.5,
  MIN_SIZE_PX: 1,
  ANGLE_LABEL_OFFSET_X: 12,
  ANGLE_LABEL_OFFSET_Y: 12,
} as const

export interface AnchorLayout {
  id: AnchorId
  x: number
  y: number
}

export interface RotateHandleLayout {
  x: number
  y: number
}

const ALL_ANCHOR_ORDER: AnchorId[] = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
  'top-center',
  'middle-right',
  'bottom-center',
  'middle-left',
]

export function resolveEnabledAnchors(element: {
  resizable: boolean
  resizeAnchors?: string[] | null
}): string[] | null {
  if (!element.resizable) return null
  if (element.resizeAnchors === null) return null
  if (element.resizeAnchors === undefined) return [...DEFAULT_ANCHORS]
  return [...element.resizeAnchors]
}

export function resolveShowRotate(element: {
  resizable: boolean
  locked?: boolean
}): boolean {
  if (element.locked) return false
  if (!element.resizable) return false
  return true
}

export function layoutAnchors(
  obbViewport: OBB,
  enabledAnchors: string[] | null,
): AnchorLayout[] {
  if (!enabledAnchors || enabledAnchors.length === 0) return []

  const [TL, TR, BR, BL] = obbViewport.corners

  const anchorPositions: Record<AnchorId, { x: number; y: number }> = {
    'top-left': TL,
    'top-right': TR,
    'bottom-right': BR,
    'bottom-left': BL,
    'top-center': { x: (TL.x + TR.x) / 2, y: (TL.y + TR.y) / 2 },
    'middle-right': { x: (TR.x + BR.x) / 2, y: (TR.y + BR.y) / 2 },
    'bottom-center': { x: (BR.x + BL.x) / 2, y: (BR.y + BL.y) / 2 },
    'middle-left': { x: (BL.x + TL.x) / 2, y: (BL.y + TL.y) / 2 },
  }

  const enabledSet = new Set(enabledAnchors)

  const result: AnchorLayout[] = []
  for (const id of ALL_ANCHOR_ORDER) {
    if (enabledSet.has(id)) {
      result.push({ id, ...anchorPositions[id] })
    }
  }
  return result
}

export function layoutRotateHandle(obbViewport: OBB): RotateHandleLayout {
  const [TL, TR] = obbViewport.corners
  const midX = (TL.x + TR.x) / 2
  const midY = (TL.y + TR.y) / 2

  const edgeVecX = TR.x - TL.x
  const edgeVecY = TR.y - TL.y
  const edgeLen = Math.sqrt(edgeVecX * edgeVecX + edgeVecY * edgeVecY)
  const nx = -edgeVecY / edgeLen
  const ny = edgeVecX / edgeLen

  const centerX = obbViewport.centerX
  const centerY = obbViewport.centerY
  const toCenterX = centerX - midX
  const toCenterY = centerY - midY
  const dot = toCenterX * nx + toCenterY * ny

  const dirX = nx * (dot > 0 ? -1 : 1)
  const dirY = ny * (dot > 0 ? -1 : 1)

  return {
    x: midX + dirX * TRANSFORM_OVERLAY_CONSTANTS.ROTATE_HANDLE_OFFSET,
    y: midY + dirY * TRANSFORM_OVERLAY_CONSTANTS.ROTATE_HANDLE_OFFSET,
  }
}

function pointInOBB(p: { x: number; y: number }, obb: OBB): boolean {
  const rad = obb.rotation * (Math.PI / 180)
  const cos = Math.cos(-rad)
  const sin = Math.sin(-rad)
  const dx = p.x - obb.centerX
  const dy = p.y - obb.centerY
  const lx = dx * cos - dy * sin
  const ly = dx * sin + dy * cos
  const hw = obb.width / 2
  const hh = obb.height / 2
  return Math.abs(lx) <= hw && Math.abs(ly) <= hh
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function pointInRect(p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }): boolean {
  return (
    p.x >= rect.x &&
    p.x <= rect.x + rect.width &&
    p.y >= rect.y &&
    p.y <= rect.y + rect.height
  )
}

function pointNearEdge(p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }, threshold: number): boolean {
  const r = rect
  const t = threshold
  return (
    (p.x >= r.x - t && p.x <= r.x + r.width + t && Math.abs(p.y - r.y) <= t) ||
    (p.x >= r.x - t && p.x <= r.x + r.width + t && Math.abs(p.y - (r.y + r.height)) <= t) ||
    (p.y >= r.y - t && p.y <= r.y + r.height + t && Math.abs(p.x - r.x) <= t) ||
    (p.y >= r.y - t && p.y <= r.y + r.height + t && Math.abs(p.x - (r.x + r.width)) <= t)
  )
}

export function hitTestTransformOverlay(
  pointer: { x: number; y: number },
  input: {
    mode: 'single' | 'multi'
    bounds: OBB | Rect2D
    enabledAnchors: string[] | null
    showRotate: boolean
    canMove: boolean
  },
): HitZone {
  if (input.showRotate) {
    const handle = layoutRotateHandle(
      input.mode === 'single'
        ? (input.bounds as OBB)
        : {
            centerX: (input.bounds as Rect2D).x + (input.bounds as Rect2D).width / 2,
            centerY: (input.bounds as Rect2D).y + (input.bounds as Rect2D).height / 2,
            width: (input.bounds as Rect2D).width,
            height: (input.bounds as Rect2D).height,
            rotation: 0,
            corners: (() => {
              const r = input.bounds as Rect2D
              return [
                { x: r.x, y: r.y },
                { x: r.x + r.width, y: r.y },
                { x: r.x + r.width, y: r.y + r.height },
                { x: r.x, y: r.y + r.height },
              ]
            })(),
          },
    )
    if (dist(pointer, handle) <= TRANSFORM_OVERLAY_CONSTANTS.ROTATE_HANDLE_HIT_RADIUS) {
      return { type: 'rotate' }
    }
  }

  const hitR = TRANSFORM_OVERLAY_CONSTANTS.ANCHOR_HIT_SIZE / 2

  if (input.mode === 'single') {
    const obb = input.bounds as OBB
    const anchors = layoutAnchors(obb, input.enabledAnchors)
    for (const a of anchors) {
      if (dist(pointer, a) <= hitR) {
        return { type: 'anchor', anchor: a.id }
      }
    }
  } else {
    const rect = input.bounds as Rect2D
    const TL = { x: rect.x, y: rect.y }
    const TR = { x: rect.x + rect.width, y: rect.y }
    const BR = { x: rect.x + rect.width, y: rect.y + rect.height }
    const BL = { x: rect.x, y: rect.y + rect.height }
    const midPositions: Record<AnchorId, { x: number; y: number }> = {
      'top-left': TL,
      'top-right': TR,
      'bottom-right': BR,
      'bottom-left': BL,
      'top-center': { x: (TL.x + TR.x) / 2, y: (TL.y + TR.y) / 2 },
      'middle-right': { x: (TR.x + BR.x) / 2, y: (TR.y + BR.y) / 2 },
      'bottom-center': { x: (BR.x + BL.x) / 2, y: (BR.y + BL.y) / 2 },
      'middle-left': { x: (BL.x + TL.x) / 2, y: (BL.y + TL.y) / 2 },
    }
    if (input.enabledAnchors) {
      const enabledSet = new Set(input.enabledAnchors)
      for (const id of ALL_ANCHOR_ORDER) {
        if (enabledSet.has(id)) {
          const pos = midPositions[id]
          if (dist(pointer, pos) <= hitR) {
            return { type: 'anchor', anchor: id }
          }
        }
      }
    }
  }

  if (input.canMove) {
    if (input.mode === 'single') {
      const obb = input.bounds as OBB
      if (pointInOBB(pointer, obb)) {
        return { type: 'move' }
      }
    } else {
      const rect = input.bounds as Rect2D
      if (pointInRect(pointer, rect)) {
        return { type: 'move' }
      }
      const edgeThreshold = TRANSFORM_OVERLAY_CONSTANTS.EDGE_HIT_WIDTH / 2
      if (pointNearEdge(pointer, rect, edgeThreshold)) {
        return { type: 'move' }
      }
    }
  }

  return { type: 'none' }
}

/**
 * 从 event.target 向上遍历 Konva 节点：
 * - name/id 包含 'transform-overlay' → true
 * - 兼容：className === 'Transformer' → true（防御残留）
 */
export function isClickOnTransformOverlay(event: { target?: any }): boolean {
  let node = event?.target
  while (node) {
    const name = typeof node.name === 'function' ? node.name() : node.name
    const id = typeof node.id === 'function' ? node.id() : node.id
    if (
      (typeof name === 'string' && name.includes('transform-overlay')) ||
      (typeof id === 'string' && id.includes('transform-overlay'))
    ) {
      return true
    }
    if (node.getClassName && node.getClassName() === 'Transformer') {
      return true
    }
    node = node.getParent ? node.getParent() : node.parent
  }
  return false
}

export function cursorForHitZone(zone: HitZone, rotationDeg: number): string {
  switch (zone.type) {
    case 'none':
      return 'default'
    case 'move':
      return 'move'
    case 'rotate':
      return 'grab'
    case 'anchor': {
      const baseAngles: Record<AnchorId, number> = {
        'top-left': 225,
        'top-right': 315,
        'bottom-right': 45,
        'bottom-left': 135,
        'middle-left': 180,
        'middle-right': 0,
        'top-center': 270,
        'bottom-center': 90,
      }
      const base = baseAngles[zone.anchor]
      const total = normalizeDeg(base + rotationDeg)
      const sector = Math.round(total / 45) % 8
      const cursors = [
        'ew-resize',
        'nwse-resize',
        'ns-resize',
        'nesw-resize',
        'ew-resize',
        'nwse-resize',
        'ns-resize',
        'nesw-resize',
      ]
      return cursors[sector]
    }
  }
}
