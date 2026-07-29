import { describe, expect, it } from 'vitest'
import {
  applyStickySnap,
  snapResultToOffset,
  computeSnap,
  type AABBLineValues,
  type StickyState,
  type SnapResult,
} from '@/utils/geometry'

const threshold = 5

function intentBox(left: number, top: number, w = 10, h = 10): AABBLineValues {
  return {
    xValues: [left, left + w, left + w / 2],
    yValues: [top, top + h, top + h / 2],
  }
}

describe('snapResultToOffset', () => {
  it('returns zeros when no snap', () => {
    expect(snapResultToOffset({ x: null, y: null })).toEqual({ offsetX: 0, offsetY: 0 })
  })

  it('computes offset from snapTo - source', () => {
    const r: SnapResult = {
      x: { snapTo: 100, source: 97, delta: 3 },
      y: { snapTo: 50, source: 52, delta: 2 },
    }
    expect(snapResultToOffset(r)).toEqual({ offsetX: 3, offsetY: -2 })
  })
})

describe('applyStickySnap', () => {
  it('locks when raw snap hits and sticky empty', () => {
    const intent = intentBox(99, 0)
    const raw = computeSnap(intent, [{ xValues: [100, 110, 105], yValues: [0, 10, 5] }], threshold)
    expect(raw.x).not.toBeNull()
    expect(raw.x!.snapTo).toBe(100)
    const { result, nextSticky } = applyStickySnap(intent, raw, { x: null, y: null }, threshold)
    expect(result.x?.snapTo).toBe(100)
    expect(nextSticky.x?.snapTo).toBe(100)
  })

  it('stays sticky while intent within threshold even if another target closer', () => {
    const locked: StickyState = {
      x: { snapTo: 100, source: 100, delta: 0 },
      y: null,
    }
    const intent = intentBox(103, 0)
    const { result, nextSticky } = applyStickySnap(intent, { x: null, y: null }, locked, threshold)
    expect(result.x?.snapTo).toBe(100)
    expect(result.x?.source).toBe(103)
    expect(snapResultToOffset(result).offsetX).toBe(-3)
    expect(nextSticky.x?.snapTo).toBe(100)
  })

  it('releases sticky when intent exceeds threshold', () => {
    const locked: StickyState = {
      x: { snapTo: 100, source: 100, delta: 0 },
      y: null,
    }
    const intent = intentBox(106, 0)
    const { result, nextSticky } = applyStickySnap(intent, { x: null, y: null }, locked, threshold)
    expect(result.x).toBeNull()
    expect(nextSticky.x).toBeNull()
  })

  it('x and y sticky are independent', () => {
    const locked: StickyState = {
      x: { snapTo: 100, source: 100, delta: 0 },
      y: { snapTo: 50, source: 50, delta: 0 },
    }
    const intent = intentBox(106, 52)
    const { result, nextSticky } = applyStickySnap(intent, { x: null, y: null }, locked, threshold)
    expect(result.x).toBeNull()
    expect(nextSticky.x).toBeNull()
    expect(result.y?.snapTo).toBe(50)
    expect(nextSticky.y?.snapTo).toBe(50)
  })
})
