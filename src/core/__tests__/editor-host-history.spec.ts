import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { EditorHost } from '@/core/editor-host'
import { createEditorHost } from '@/create-host'
import Toolbar from '@/core/Toolbar.vue'
import { BaseCommand } from '@/commands/base-command'
import type { ICommand } from '@/commands/i-command'
import type { HistoryEventData, ToolEventData } from '@/types/event-data'

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

function stubComponents() {
  return {
    VkButton: {
      template: '<button :disabled="disabled" :title="title"><slot /></button>',
      props: ['disabled', 'title', 'text', 'variant'],
    },
    IconUndo: { template: '<span class="stub-icon-undo" />' },
    IconRedo: { template: '<span class="stub-icon-redo" />' },
  }
}

describe('EditorHost history:changed event', () => {
  let host: EditorHost

  beforeEach(() => {
    host = new EditorHost()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('executeCommand 在非合并路径发出 history:changed，canUndo=true', () => {
    const payloads: HistoryEventData[] = []
    host.on('history:changed', (p) => payloads.push(p))

    host.executeCommand(new NoopCommand(host))

    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
      canUndo: true,
      canRedo: false,
      source: 'EditorHost',
    })
    expect(typeof payloads[0]?.timestamp).toBe('number')
  })

  it('初始无历史时 undo/redo 均不改变状态，不发 history:changed', () => {
    const payloads: HistoryEventData[] = []
    host.on('history:changed', (p) => payloads.push(p))

    host.undo()
    host.redo()

    expect(payloads).toHaveLength(0)
    expect(asInternals(host).currentCommandIndex).toBe(-1)
  })

  it('execute → undo → redo 全流程 canUndo/canRedo 正确切换', () => {
    const payloads: HistoryEventData[] = []
    host.on('history:changed', (p) => payloads.push(p))

    host.executeCommand(new NoopCommand(host))
    const afterExecute = payloads[payloads.length - 1]!
    expect(afterExecute.canUndo).toBe(true)
    expect(afterExecute.canRedo).toBe(false)

    host.undo()
    const afterUndo = payloads[payloads.length - 1]!
    expect(afterUndo.canUndo).toBe(false)
    expect(afterUndo.canRedo).toBe(true)

    host.redo()
    const afterRedo = payloads[payloads.length - 1]!
    expect(afterRedo.canUndo).toBe(true)
    expect(afterRedo.canRedo).toBe(false)
  })

  it('undo 后执行新命令 → canRedo=false（redo 区段被截断）', () => {
    const payloads: HistoryEventData[] = []
    host.on('history:changed', (p) => payloads.push(p))

    host.executeCommand(new NoopCommand(host))
    host.undo()
    expect(payloads[payloads.length - 1]!.canRedo).toBe(true)

    host.executeCommand(new NoopCommand(host))
    expect(payloads[payloads.length - 1]!).toMatchObject({
      canUndo: true,
      canRedo: false,
    })
  })

  it('合并路径也发出 history:changed（但不发 command:executed）', () => {
    class MergeableCommand extends BaseCommand {
      public name = 'MERGE'
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
        return this
      }
    }

    const historyPayloads: HistoryEventData[] = []
    const executedPayloads: unknown[] = []
    host.on('history:changed', (p) => historyPayloads.push(p))
    host.on('command:executed', (p) => executedPayloads.push(p))

    host.executeCommand(new MergeableCommand(host))
    host.executeCommand(new MergeableCommand(host))

    expect(executedPayloads).toHaveLength(1)
    expect(historyPayloads).toHaveLength(2)
    expect(historyPayloads[1]).toMatchObject({ canUndo: true, canRedo: false })
  })
})

describe('EditorHost loadJSON history:cleared', () => {
  let host: EditorHost
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    host = createEditorHost()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('loadJSON 成功后发 history:cleared 并清空栈', () => {
    host.executeCommand(new NoopCommand(host))
    expect(asInternals(host).commandStack.length).toBe(1)

    const clearedPayloads: HistoryEventData[] = []
    const changedPayloads: HistoryEventData[] = []
    host.on('history:cleared', (p) => clearedPayloads.push(p))
    host.on('history:changed', (p) => changedPayloads.push(p))

    const json = JSON.stringify({ state: { zoom: 1 }, elements: [] })
    host.loadJSON(json)

    expect(asInternals(host).commandStack).toHaveLength(0)
    expect(asInternals(host).currentCommandIndex).toBe(-1)
    expect(clearedPayloads).toHaveLength(1)
    expect(clearedPayloads[0]).toMatchObject({ canUndo: false, canRedo: false })
    expect(changedPayloads).toHaveLength(1)
    expect(changedPayloads[0]).toMatchObject({ canUndo: false, canRedo: false })
  })

  it('loadJSON 失败时不发 history:cleared / history:changed', () => {
    host.executeCommand(new NoopCommand(host))

    const clearedPayloads: HistoryEventData[] = []
    const changedPayloads: HistoryEventData[] = []
    host.on('history:cleared', (p) => clearedPayloads.push(p))
    host.on('history:changed', (p) => changedPayloads.push(p))

    host.loadJSON('{ not valid json')

    expect(clearedPayloads).toHaveLength(0)
    expect(changedPayloads).toHaveLength(0)
    expect(asInternals(host).commandStack).toHaveLength(1)
  })
})

describe('Toolbar undo/redo 按钮状态', () => {
  let host: EditorHost
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  const StubTool = defineComponent({
    props: { host: { type: Object, default: null } },
    setup() {
      return () => h('span', { class: 'stub-tool' })
    },
  })

  function registerDummyTools(target: EditorHost) {
    const groups: Array<'tools' | 'actions'> = ['tools', 'actions']
    for (const group of groups) {
      target.emit('tool:registered', {
        toolName: `dummy-${group}`,
        render: () => StubTool,
        group,
        timestamp: Date.now(),
        source: 'test',
      } as ToolEventData)
    }
  }

  beforeEach(() => {
    host = createEditorHost()
    registerDummyTools(host)
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  function mountToolbar() {
    return mount(Toolbar, {
      props: { host },
      global: { stubs: stubComponents() },
    })
  }

  function findButtons(wrapper: ReturnType<typeof mountToolbar>) {
    const buttons = wrapper.findAll('button')
    const undo = buttons.find((b) => b.attributes('title') === '撤销')
    const redo = buttons.find((b) => b.attributes('title') === '重做')
    return { undo, redo }
  }

  it('初始挂载时 undo/redo 按钮均禁用', async () => {
    const wrapper = mountToolbar()
    await nextTick()

    const { undo, redo } = findButtons(wrapper)
    expect(undo).toBeDefined()
    expect(redo).toBeDefined()
    expect(undo!.attributes('disabled')).toBeDefined()
    expect(redo!.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('执行命令后 undo 按钮启用，redo 仍禁用', async () => {
    const wrapper = mountToolbar()
    await nextTick()

    host.executeCommand(new NoopCommand(host))
    await nextTick()

    const { undo, redo } = findButtons(wrapper)
    expect(undo!.attributes('disabled')).toBeUndefined()
    expect(redo!.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('undo 后 redo 按钮启用', async () => {
    const wrapper = mountToolbar()
    await nextTick()

    host.executeCommand(new NoopCommand(host))
    await nextTick()
    host.undo()
    await nextTick()

    const { undo, redo } = findButtons(wrapper)
    expect(undo!.attributes('disabled')).toBeDefined()
    expect(redo!.attributes('disabled')).toBeUndefined()

    wrapper.unmount()
  })

  it('执行新命令后 redo 按钮再次禁用', async () => {
    const wrapper = mountToolbar()
    await nextTick()

    host.executeCommand(new NoopCommand(host))
    await nextTick()
    host.undo()
    await nextTick()
    host.executeCommand(new NoopCommand(host))
    await nextTick()

    const { undo, redo } = findButtons(wrapper)
    expect(undo!.attributes('disabled')).toBeUndefined()
    expect(redo!.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('卸载后不再响应 history:changed（handler 已 off）', async () => {
    const wrapper = mountToolbar()
    await nextTick()
    wrapper.unmount()
    await nextTick()

    const payloads: HistoryEventData[] = []
    host.on('history:changed', (p) => payloads.push(p))

    host.executeCommand(new NoopCommand(host))
    expect(payloads).toHaveLength(1)
  })
})
