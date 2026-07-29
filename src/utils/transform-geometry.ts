import type { IGraphicElement } from '@/types'
import type { AABB } from '@/utils/geometry'
import { getElementAABB, unionAABB } from '@/utils/geometry'

export interface ViewportTransform {
  contentX: number
  contentY: number
  zoom: number
}

export interface Rect2D {
  x: number
  y: number
  width: number
  height: number
}

export interface OBB {
  centerX: number
  centerY: number
  width: number
  height: number
  rotation: number
  corners: Array<{ x: number; y: number }>
}

const DEG2RAD = Math.PI / 180

export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

export function formatRotationLabel(deg: number): string {
  return Math.round(normalizeDeg(deg)) + '\u00B0'
}

export function contentToViewport(
  x: number,
  y: number,
  vp: ViewportTransform,
): { x: number; y: number } {
  return {
    x: vp.contentX + x * vp.zoom,
    y: vp.contentY + y * vp.zoom,
  }
}

export function viewportToContent(
  x: number,
  y: number,
  vp: ViewportTransform,
): { x: number; y: number } {
  const z = vp.zoom || 1
  return {
    x: (x - vp.contentX) / z,
    y: (y - vp.contentY) / z,
  }
}

export function getElementOBB(input: {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX?: number
  scaleY?: number
}): OBB {
  const w = input.width * (input.scaleX ?? 1)
  const h = input.height * (input.scaleY ?? 1)
  const rad = input.rotation * DEG2RAD
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const localCorners = [
    { lx: 0, ly: 0 },
    { lx: w, ly: 0 },
    { lx: w, ly: h },
    { lx: 0, ly: h },
  ]

  const corners = localCorners.map((c) => ({
    x: input.x + c.lx * cos - c.ly * sin,
    y: input.y + c.lx * sin + c.ly * cos,
  }))

  return {
    centerX: (corners[0].x + corners[2].x) / 2,
    centerY: (corners[0].y + corners[2].y) / 2,
    width: w,
    height: h,
    rotation: input.rotation,
    corners,
  }
}

export function getElementOBBFromSource(
  element: IGraphicElement,
  _node: {
    x: () => number
    y: () => number
    rotation: () => number
    scaleX: () => number
    scaleY: () => number
  } | null | undefined,
): OBB {
  return getElementOBB({
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
  })
}

export function obbToViewport(obb: OBB, vp: ViewportTransform): OBB {
  const vpCenter = contentToViewport(obb.centerX, obb.centerY, vp)
  return {
    centerX: vpCenter.x,
    centerY: vpCenter.y,
    width: obb.width * vp.zoom,
    height: obb.height * vp.zoom,
    rotation: obb.rotation,
    corners: obb.corners.map((c) => contentToViewport(c.x, c.y, vp)),
  }
}

export function getSelectionUnionRect(
  items: Array<{
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX?: number
    scaleY?: number
  }>,
): Rect2D | null {
  if (items.length === 0) return null
  const aabbs: AABB[] = []
  for (const item of items) {
    aabbs.push(
      getElementAABB({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
        scaleX: item.scaleX ?? 1,
        scaleY: item.scaleY ?? 1,
      }),
    )
  }
  const union = unionAABB(aabbs)
  return union ? aabbToRect(union) : null
}

export function aabbToRect(aabb: AABB): Rect2D {
  return {
    x: aabb.left,
    y: aabb.top,
    width: aabb.right - aabb.left,
    height: aabb.bottom - aabb.top,
  }
}

export function rectToViewport(rect: Rect2D, vp: ViewportTransform): Rect2D {
  const topLeft = contentToViewport(rect.x, rect.y, vp)
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width * vp.zoom,
    height: rect.height * vp.zoom,
  }
}
