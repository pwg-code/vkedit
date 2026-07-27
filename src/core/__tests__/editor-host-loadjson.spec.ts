import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { createEditorHost } from '@/create-host'
import { BaseCommand } from '@/commands/base-command'
import type { ICommand } from '@/commands/i-command'
import type {
  EditorLifecyclePayload,
  ErrorEventData,
  HistoryEventData,
} from '@/types/event-data'

interface HostInternals {
  commandStack: ICommand[]
  currentCommandIndex: number
}

function asInternals(host: EditorHost): HostInternals {
  return host as unknown as HostInternals
}

class NoopCommand extends BaseCommand {
  public name = 'NOOP'
  public execute(): void {
    /* no-op */
  }
  public undo(): void {
    /* no-op */
  }
}

describe('EditorHost loadJSON editor:reset & history events', () => {
  let host: EditorHost
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    host = createEditorHost()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('合法 JSON：editor:reset 恰好一次，history:cleared 一次，history:changed canUndo/canRedo 均为 false', () => {
    host.executeCommand(new NoopCommand(host))
    expect(asInternals(host).commandStack.length).toBe(1)

    const resetPayloads: EditorLifecyclePayload[] = []
    const clearedPayloads: HistoryEventData[] = []
    const changedPayloads: HistoryEventData[] = []
    const eventOrder: string[] = []
    host.on('editor:reset', (p) => {
      resetPayloads.push(p)
      eventOrder.push('editor:reset')
    })
    host.on('history:cleared', (p) => {
      clearedPayloads.push(p)
      eventOrder.push('history:cleared')
    })
    host.on('history:changed', (p) => {
      changedPayloads.push(p)
      eventOrder.push('history:changed')
    })

    const json = JSON.stringify({ state: { zoom: 1 }, elements: [] })
    host.loadJSON(json)

    expect(resetPayloads).toHaveLength(1)
    expect(resetPayloads[0]).toMatchObject({ source: 'EditorHost.loadJSON' })
    expect(typeof resetPayloads[0]?.timestamp).toBe('number')

    expect(clearedPayloads).toHaveLength(1)
    expect(clearedPayloads[0]).toMatchObject({ canUndo: false, canRedo: false })

    expect(changedPayloads).toHaveLength(1)
    expect(changedPayloads[0]).toMatchObject({ canUndo: false, canRedo: false })

    expect(asInternals(host).commandStack).toHaveLength(0)
    expect(asInternals(host).currentCommandIndex).toBe(-1)

    expect(eventOrder).toEqual(['editor:reset', 'history:cleared', 'history:changed'])
  })

  it('非法 JSON：不发 editor:reset / history:cleared，发 host:load-json:error，旧历史保留', () => {
    host.executeCommand(new NoopCommand(host))
    expect(asInternals(host).commandStack.length).toBe(1)

    const resetPayloads: EditorLifecyclePayload[] = []
    const clearedPayloads: HistoryEventData[] = []
    const changedPayloads: HistoryEventData[] = []
    const errorPayloads: ErrorEventData[] = []
    host.on('editor:reset', (p) => resetPayloads.push(p))
    host.on('history:cleared', (p) => clearedPayloads.push(p))
    host.on('history:changed', (p) => changedPayloads.push(p))
    host.on('host:load-json:error', (p) => errorPayloads.push(p))

    host.loadJSON('{ not valid json')

    expect(resetPayloads).toHaveLength(0)
    expect(clearedPayloads).toHaveLength(0)
    expect(changedPayloads).toHaveLength(0)
    expect(errorPayloads).toHaveLength(1)
    expect(errorPayloads[0]?.error).toBeInstanceOf(Error)
    expect(asInternals(host).commandStack).toHaveLength(1)
    expect(asInternals(host).currentCommandIndex).toBe(0)
  })

  it('成功 loadJSON 后撤销/重做进入不可用状态（history:changed canUndo=false / canRedo=false）', () => {
    host.executeCommand(new NoopCommand(host))
    host.undo()

    const changedPayloads: HistoryEventData[] = []
    host.on('history:changed', (p) => changedPayloads.push(p))

    expect(asInternals(host).currentCommandIndex).toBe(-1)
    expect(asInternals(host).commandStack.length).toBe(1)

    const json = JSON.stringify({ state: { zoom: 2 }, elements: [] })
    host.loadJSON(json)

    expect(changedPayloads).toHaveLength(1)
    expect(changedPayloads[0]).toMatchObject({ canUndo: false, canRedo: false })
    expect(asInternals(host).commandStack).toHaveLength(0)
    expect(asInternals(host).currentCommandIndex).toBe(-1)
  })
})
