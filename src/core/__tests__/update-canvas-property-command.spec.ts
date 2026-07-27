import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import {
  UpdateCanvasPropertyCommand,
  type CanvasPropertySnapshot,
} from '@/commands/update-canvas-property-command'
import { BaseCommand } from '@/commands/base-command'
import type { ICommand } from '@/commands/i-command'

interface HostInternals {
  commandStack: ICommand[]
  currentCommandIndex: number
}

function asInternals(host: EditorHost): HostInternals {
  return host as unknown as HostInternals
}

function snapshot(host: EditorHost): CanvasPropertySnapshot {
  return {
    dpm: host.status.dpm,
    width: host.status.width,
    height: host.status.height,
    wmm: host.status.wmm,
    hmm: host.status.hmm,
  }
}

const INITIAL = { dpm: 8, width: 400, height: 400, wmm: 50, hmm: 50 }

describe('UpdateCanvasPropertyCommand execute/undo/redo', () => {
  let host: EditorHost

  beforeEach(() => {
    host = new EditorHost()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('execute 后状态正确更新（dpm 联动重算 width/height）', () => {
    const cmd = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 })
    host.executeCommand(cmd)

    expect(host.status.dpm).toBe(10)
    expect(host.status.width).toBe(500)
    expect(host.status.height).toBe(500)
    expect(host.status.wmm).toBe(50)
    expect(host.status.hmm).toBe(50)
  })

  it('undo 后状态完整恢复（dpm 联动字段全部还原）', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 }))
    host.undo()

    expect(host.status.dpm).toBe(INITIAL.dpm)
    expect(host.status.width).toBe(INITIAL.width)
    expect(host.status.height).toBe(INITIAL.height)
    expect(host.status.wmm).toBe(INITIAL.wmm)
    expect(host.status.hmm).toBe(INITIAL.hmm)
  })

  it('redo 后状态重新应用', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 }))
    host.undo()
    host.redo()

    expect(host.status.dpm).toBe(10)
    expect(host.status.width).toBe(500)
    expect(host.status.height).toBe(500)
    expect(host.status.wmm).toBe(50)
    expect(host.status.hmm).toBe(50)
  })

  it('dpm 变更 undo 后 width/height/wmm/hmm 全部正确恢复', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 12 }))
    expect(host.status.width).toBe(600)
    expect(host.status.height).toBe(600)

    host.undo()
    expect(host.status).toMatchObject(INITIAL)
  })

  it('width 变更 undo 后 wmm 正确恢复', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'width', snapshot(host), { width: 480 }))
    expect(host.status.width).toBe(480)
    expect(host.status.wmm).toBe(60)

    host.undo()
    expect(host.status.width).toBe(INITIAL.width)
    expect(host.status.wmm).toBe(INITIAL.wmm)
  })

  it('height 变更 undo 后 hmm 正确恢复', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'height', snapshot(host), { height: 560 }))
    expect(host.status.height).toBe(560)
    expect(host.status.hmm).toBe(70)

    host.undo()
    expect(host.status.height).toBe(INITIAL.height)
    expect(host.status.hmm).toBe(INITIAL.hmm)
  })
})

describe('UpdateCanvasPropertyCommand canMergeWith', () => {
  let host: EditorHost

  beforeEach(() => {
    host = new EditorHost()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('同属性 + 1000ms 内 → true', () => {
    const a = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 9 })
    const b = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 })

    expect(a.canMergeWith(b)).toBe(true)
  })

  it('不同属性 → false', () => {
    const a = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 })
    const b = new UpdateCanvasPropertyCommand(host, 'width', snapshot(host), { width: 480 })

    expect(a.canMergeWith(b)).toBe(false)
  })

  it('超过 1000ms → false', () => {
    const a = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 9 })
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 1, 100))

    const b = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 })

    expect(a.canMergeWith(b)).toBe(false)
  })

  it('非 UpdateCanvasPropertyCommand → false', () => {
    class OtherCommand extends BaseCommand {
      public name = 'OTHER'
      public execute(): void {
        /* no-op */
      }
      public undo(): void {
        /* no-op */
      }
    }

    const a = new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 })
    const b = new OtherCommand(host)

    expect(a.canMergeWith(b)).toBe(false)
  })
})

describe('UpdateCanvasPropertyCommand mergeWith', () => {
  let host: EditorHost

  beforeEach(() => {
    host = new EditorHost()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mergeWith 保留首条 oldState + 末条 newStatus', () => {
    const firstOldState = snapshot(host)
    const a = new UpdateCanvasPropertyCommand(host, 'dpm', firstOldState, { dpm: 9 })

    host.executeCommand(a)
    // 第二条命令执行前，状态已被第一条改变
    const secondOldState = snapshot(host)
    const b = new UpdateCanvasPropertyCommand(host, 'dpm', secondOldState, { dpm: 11 })

    host.executeCommand(b)

    expect(asInternals(host).commandStack.length).toBe(1)

    host.undo()
    // undo 后应回到首条命令前的状态（oldState 来自第一条命令）
    expect(host.status).toMatchObject(firstOldState)

    host.redo()
    // redo 后应到达末条命令的新值
    expect(host.status.dpm).toBe(11)
  })

  it('连续合并后 undo 一次性回到起点', () => {
    const startState = snapshot(host)
    // 模拟 dpm 8 → 9 → 10 → 11（1000ms 内）
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 9 }))
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 }))
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 11 }))

    expect(asInternals(host).commandStack.length).toBe(1)
    expect(host.status.dpm).toBe(11)

    host.undo()
    expect(host.status).toMatchObject(startState)
    expect(asInternals(host).currentCommandIndex).toBe(-1)

    host.redo()
    expect(host.status.dpm).toBe(11)
    expect(asInternals(host).currentCommandIndex).toBe(0)
  })

  it('不同属性不合并：栈中保留两条独立历史', () => {
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'dpm', snapshot(host), { dpm: 10 }))
    host.executeCommand(new UpdateCanvasPropertyCommand(host, 'width', snapshot(host), { width: 480 }))

    expect(asInternals(host).commandStack.length).toBe(2)

    // undo 先撤销 width
    host.undo()
    expect(host.status.width).toBe(INITIAL.width)
    expect(host.status.dpm).toBe(10)

    // 再 undo 撤销 dpm
    host.undo()
    expect(host.status.dpm).toBe(INITIAL.dpm)
  })
})

describe('UpdateCanvasPropertyCommand 与元素命令交叉 undo', () => {
  let host: EditorHost

  beforeEach(() => {
    host = new EditorHost()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('画布属性与元素命令交叉 undo 时序正确', () => {
    class FakeElementCommand extends BaseCommand {
      public name = 'FAKE_ELEMENT'
      private applied = false
      public execute(): void {
        this.applied = true
      }
      public undo(): void {
        this.applied = false
      }
      public get isApplied() {
        return this.applied
      }
    }

    const canvasCmd = new UpdateCanvasPropertyCommand(host, 'width', snapshot(host), { width: 480 })
    host.executeCommand(canvasCmd)
    const elementCmd = new FakeElementCommand(host)
    host.executeCommand(elementCmd)

    expect(asInternals(host).commandStack.length).toBe(2)
    expect(host.status.width).toBe(480)
    expect(elementCmd.isApplied).toBe(true)

    // undo 先撤销元素命令
    host.undo()
    expect(elementCmd.isApplied).toBe(false)
    expect(host.status.width).toBe(480)

    // 再 undo 撤销画布属性
    host.undo()
    expect(host.status.width).toBe(INITIAL.width)
  })
})
