import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createEditorHost } from '@/create-host'
import Editor from '@/core/Editor.vue'
import type { EditorLifecyclePayload } from '@/types'

function stubChildComponents() {
  return {
    global: {
      stubs: {
        Toolbar: { template: '<div class="stub-toolbar" />' },
        GraphicToolPanel: { template: '<div class="stub-graphic-tool-panel" />' },
        StageView: { template: '<div class="stub-stage-view" />' },
        PropertyPanel: { template: '<div class="stub-property-panel" />' },
        LayerPanel: { template: '<div class="stub-layer-panel" />' },
        IconMenu: { template: '<span class="stub-icon-menu" />' },
        IconCategory: { template: '<span class="stub-icon-category" />' },
        IconChevronLeft: { template: '<span class="stub-icon-chevron-left" />' },
        IconChevronRight: { template: '<span class="stub-icon-chevron-right" />' },
        IconSettings: { template: '<span class="stub-icon-settings" />' },
      },
    },
  }
}

describe('Editor.vue lifecycle events', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // jsdom 默认 innerWidth=1024，保证 isTooSmall=false 触发 onResize() 时不出岔子
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
      writable: true,
    })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('emits editor:ready once on mount with the expected payload', async () => {
    const host = createEditorHost()
    const readySpy = vi.fn<(payload: EditorLifecyclePayload) => void>()
    host.on('editor:ready', readySpy)

    const wrapper = mount(Editor, {
      props: { host },
      ...stubChildComponents(),
    })
    await nextTick()
    await flushPromises()

    expect(readySpy).toHaveBeenCalledTimes(1)
    const payload = readySpy.mock.calls[0]?.[0]
    expect(payload).toBeDefined()
    expect(payload).toMatchObject({ source: 'Editor.vue' })
    expect(typeof payload!.timestamp).toBe('number')

    wrapper.unmount()
  })

  it('emits editor:destroy once on unmount with the expected payload', async () => {
    const host = createEditorHost()
    const destroySpy = vi.fn<(payload: EditorLifecyclePayload) => void>()
    host.on('editor:destroy', destroySpy)

    const wrapper = mount(Editor, {
      props: { host },
      ...stubChildComponents(),
    })
    await nextTick()
    await flushPromises()

    expect(destroySpy).not.toHaveBeenCalled()

    wrapper.unmount()
    await nextTick()
    await flushPromises()

    expect(destroySpy).toHaveBeenCalledTimes(1)
    const payload = destroySpy.mock.calls[0]?.[0]
    expect(payload).toBeDefined()
    expect(payload).toMatchObject({ source: 'Editor.vue' })
    expect(typeof payload!.timestamp).toBe('number')
  })

  it('emits editor:destroy before tearing down window listeners', async () => {
    const host = createEditorHost()
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const destroyOrder: string[] = []
    host.on('editor:destroy', () => {
      destroyOrder.push('destroy')
    })

    const wrapper = mount(Editor, {
      props: { host },
      ...stubChildComponents(),
    })
    await nextTick()
    await flushPromises()

    wrapper.unmount()
    await nextTick()
    await flushPromises()

    expect(destroyOrder[0]).toBe('destroy')
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    removeSpy.mockRestore()
  })

  it('does not throw and does not log errors when host is undefined', async () => {
    const wrapper = mount(Editor, {
      props: {},
      ...stubChildComponents(),
    })
    await nextTick()
    await flushPromises()

    expect(() => wrapper.unmount()).not.toThrow()
    await nextTick()
    await flushPromises()

    // 没有 host 时，整个组件不应因生命周期事件补丁产生额外异常（控制台错误）
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})