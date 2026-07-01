export interface AABBInput {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

export interface AABB {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}

export interface GuideLine {
  axis: 'x' | 'y'
  value: number
}

export interface AABBLineValues {
  xValues: number[]
  yValues: number[]
}

export interface SnapMatch {
  snapTo: number
  source: number
  delta: number
}

export interface SnapResult {
  x: SnapMatch | null
  y: SnapMatch | null
}

const DEG2RAD = Math.PI / 180

export function getElementAABB(input: AABBInput): AABB {
  const { x, y, width, height, rotation, scaleX, scaleY } = input
  const w = width * scaleX
  const h = height * scaleY
  const rad = rotation * DEG2RAD
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const corners = [
    { lx: 0, ly: 0 },
    { lx: w, ly: 0 },
    { lx: w, ly: h },
    { lx: 0, ly: h },
  ]

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const c of corners) {
    const rx = c.lx * cos - c.ly * sin
    const ry = c.lx * sin + c.ly * cos
    const ax = rx + x
    const ay = ry + y
    if (ax < minX) minX = ax
    if (ax > maxX) maxX = ax
    if (ay < minY) minY = ay
    if (ay > maxY) maxY = ay
  }

  return {
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

export function getAABBLineValues(aabb: AABB): AABBLineValues {
  return {
    xValues: [aabb.left, aabb.right, aabb.centerX],
    yValues: [aabb.top, aabb.bottom, aabb.centerY],
  }
}

export function unionAABB(aabbs: AABB[]): AABB | null {
  if (aabbs.length === 0) return null
  let left = Infinity
  let right = -Infinity
  let top = Infinity
  let bottom = -Infinity
  for (const a of aabbs) {
    if (a.left < left) left = a.left
    if (a.right > right) right = a.right
    if (a.top < top) top = a.top
    if (a.bottom > bottom) bottom = a.bottom
  }
  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  }
}

export function computeSnap(
  dragged: AABBLineValues,
  targets: AABBLineValues[],
  threshold: number,
): SnapResult {
  let bestX: SnapMatch | null = null
  let bestY: SnapMatch | null = null

  for (const target of targets) {
    for (const s of dragged.xValues) {
      for (const t of target.xValues) {
        const d = Math.abs(s - t)
        if (d <= threshold && (bestX === null || d < bestX.delta)) {
          bestX = { snapTo: t, source: s, delta: d }
        }
      }
    }
    for (const s of dragged.yValues) {
      for (const t of target.yValues) {
        const d = Math.abs(s - t)
        if (d <= threshold && (bestY === null || d < bestY.delta)) {
          bestY = { snapTo: t, source: s, delta: d }
        }
      }
    }
  }

  return { x: bestX, y: bestY }
}
