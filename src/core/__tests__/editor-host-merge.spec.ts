import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { UpdatePropertyCommand } from '@/commands/update-property-command'
import { TransformElementCommand } from '@/commands/transform-element-command'
import { BaseCommand } from '@/commands/base-command'
import type { ICommand } from '@/commands/i-command'
import type { CommandEventData } from '@/types/event-data'

interface HostInternals {
  commandStack: ICommand[]
  currentCommandIndex: number
}

function asInternals(host: EditorHost): HostInternals {
  return host as unknown as HostInternals
}

function createGraphicElement(id: string) {
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
    getBoundingBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    clone() {
      return this
    },
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
  }
}

describe('EditorHost.executeCommand 合并', () => {
  let host: EditorHost
  let element: ReturnType<typeof createGraphicElement>

  beforeEach(() => {
    host = new EditorHost()
    element = createGraphicElement('element-1')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('1000 次同元素同字段连续更新：栈长度为 1；undo 恢复初值；redo 回到末值', () => {
    // 模拟滑块拖拽：每帧外部先把 element 推到目标值，再用 command 记录历史
    for (let i = 1; i <= 1000; i++) {
      element.rotation = i
      host.executeCommand(
        new UpdatePropertyCommand(host, element, 'rotation', i - 1, i),
      )
    }
    expect(element.rotation).toBe(1000)
    expect(asInternals(host).commandStack.length).toBe(1)
    expect(asInternals(host).currentCommandIndex).toBe(0)

    host.undo()
    expect(element.rotation).toBe(0)
    expect(asInternals(host).currentCommandIndex).toBe(-1)

    host.redo()
    expect(element.rotation).toBe(1000)
    expect(asInternals(host).currentCommandIndex).toBe(0)
  })

  it('不同字段不合并：栈中保留两条独立历史', () => {
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 0, 45))
    host.executeCommand(new UpdatePropertyCommand(host, element, 'width', 10, 20))

    expect(asInternals(host).commandStack.length).toBe(2)
    expect(element.rotation).toBe(45)
    expect(element.width).toBe(20)

    host.undo()
    expect(element.width).toBe(10)
    expect(element.rotation).toBe(45)

    host.undo()
    expect(element.rotation).toBe(0)
  })

  it('不同元素同字段不合并：栈中保留两条独立历史', () => {
    const other = createGraphicElement('element-2')
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 0, 10))
    host.executeCommand(new UpdatePropertyCommand(host, other, 'rotation', 0, 20))

    expect(asInternals(host).commandStack.length).toBe(2)
  })

  it('undo 后再执行新命令：redo 不再可用', () => {
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 0, 10))
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 10, 20))
    expect(asInternals(host).commandStack.length).toBe(1)

    host.undo()
    expect(asInternals(host).currentCommandIndex).toBe(-1)
    expect(element.rotation).toBe(0)

    // 用一个不会合并的字段触发新命令，确保走完整 push+execute 路径
    host.executeCommand(new UpdatePropertyCommand(host, element, 'width', 10, 99))
    expect(asInternals(host).commandStack.length).toBe(1)
    expect(asInternals(host).currentCommandIndex).toBe(0)
    expect(element.width).toBe(99)

    host.redo()
    expect(element.width).toBe(99)
    expect(asInternals(host).currentCommandIndex).toBe(0)
  })

  it('合并路径不重复 emit command:executed', () => {
    const executed: CommandEventData[] = []
    host.on('command:executed', (payload) => executed.push(payload))

    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 0, 1))
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 1, 2))
    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 2, 3))

    expect(executed).toHaveLength(1)
    expect(asInternals(host).commandStack.length).toBe(1)
  })

  it('UpdatePropertyCommand：时间窗边界外不再合并', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0))

    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 0, 1))
    expect(asInternals(host).commandStack.length).toBe(1)

    // 推进 1100ms，超过 1000ms 窗口
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 1, 100))

    host.executeCommand(new UpdatePropertyCommand(host, element, 'rotation', 1, 2))
    expect(asInternals(host).commandStack.length).toBe(2)
  })

  it('TransformElementCommand：500ms 窗口内连续 move 合并，窗口外不合并', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0))

    host.executeCommand(
      new TransformElementCommand(host, element, { x: 0, y: 0 }, { x: 5, y: 5 }),
    )
    // 200ms 后再来一次 move，仍在 500ms 窗口内
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0, 200))
    host.executeCommand(
      new TransformElementCommand(host, element, { x: 0, y: 0 }, { x: 9, y: 9 }),
    )
    expect(asInternals(host).commandStack.length).toBe(1)

    // 再过 700ms，累计 900ms，超出 500ms 窗口
    vi.setSystemTime(new Date(2025, 0, 1, 0, 0, 0, 900))
    host.executeCommand(
      new TransformElementCommand(host, element, { x: 0, y: 0 }, { x: 12, y: 12 }),
    )
    expect(asInternals(host).commandStack.length).toBe(2)
  })

  it('mergeWith 抛错：异常原样传播，栈不追加新命令', () => {
    class BoomCommand extends BaseCommand {
      public name = 'BOOM'
      public execute(): void {
        /* no-op */
      }
      public undo(): void {
        /* no-op */
      }
      public canMergeWith(): boolean {
        return true
      }
      public mergeWith(): ICommand {
        throw new Error('merge boom')
      }
    }

    host.executeCommand(new BoomCommand(host))
    expect(asInternals(host).commandStack.length).toBe(1)
    expect(asInternals(host).currentCommandIndex).toBe(0)

    expect(() => host.executeCommand(new BoomCommand(host))).toThrow('merge boom')
    expect(asInternals(host).commandStack.length).toBe(1)
    expect(asInternals(host).currentCommandIndex).toBe(0)
  })

  it('mergeWith 返回新命令时，栈顶被替换为合并结果', () => {
    class ReplaceCommand extends BaseCommand {
      public name = 'REPLACE'
      public marker: string
      constructor(host: EditorHost, marker: string) {
        super(host, marker)
        this.marker = marker
      }
      public execute(): void {
        /* no-op */
      }
      public undo(): void {
        /* no-op */
      }
      public canMergeWith(other: ICommand): boolean {
        return other instanceof ReplaceCommand
      }
      public mergeWith(other: ICommand): ICommand {
        const incoming = other as ReplaceCommand
        return new ReplaceCommand(this.host, `${this.marker}|${incoming.marker}`)
      }
    }

    const a = new ReplaceCommand(host, 'a')
    const b = new ReplaceCommand(host, 'b')
    host.executeCommand(a)
    host.executeCommand(b)
    const top = asInternals(host).commandStack[asInternals(host).commandStack.length - 1] as ReplaceCommand
    expect(top).not.toBe(a)
    expect(top).not.toBe(b)
    expect(top.marker).toBe('a|b')
    expect(asInternals(host).commandStack.length).toBe(1)
  })
})
