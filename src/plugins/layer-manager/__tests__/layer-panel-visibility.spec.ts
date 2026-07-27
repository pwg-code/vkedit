import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createEditorHost } from '@/create-host'
import LayerPanel from '@/plugins/layer-manager/LayerPanel.vue'
import type { IGraphicElement } from '@/types/base'
import type { LayerVisibilityChangedPayload } from '@/types/event-data'

function createElement(id: string, visible: boolean): IGraphicElement {
  const element: IGraphicElement = {
    id,
    type: 'test',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible,
    locked: false,
    draggable: true,
    resizable: true,
    zIndex: 0,
    getBoundingBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    clone() {
      return createElement(this.id, this.visible)
    },
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
  }
  return element
}

function stubIcons() {
  return {
    IconDragIndicator: { template: '<span class="stub-drag" />' },
    IconMoreVert: { template: '<span class="stub-more" />' },
    IconVerticalAlignTop: { template: '<span class="stub-top" />' },
    IconArrowUpward: { template: '<span class="stub-up" />' },
    IconArrowDownward: { template: '<span class="stub-down" />' },
    IconVerticalAlignBottom: { template: '<span class="stub-bottom" />' },
    IconEdit: { template: '<span class="stub-edit" />' },
    IconContentCopy: { template: '<span class="stub-copy" />' },
    IconDelete: { template: '<span class="stub-delete" />' },
    IconLock: { template: '<span class="stub-lock" />' },
    IconLockOpenRight: { template: '<span class="stub-lock-open" />' },
    IconVisibility: { template: '<span class="stub-visibility" />' },
    IconVisibilityOff: { template: '<span class="stub-visibility-off" />' },
    IconCircle: { template: '<span class="stub-circle" />' },
  }
}

describe('LayerPanel / layer:visibility-change event', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('emits layer:visibility-change with the final visible value when toggle is clicked', async () => {
    const host = createEditorHost()
    const registry = host.getPlugin('graphic-registry-plugin') as { elements: Map<string, IGraphicElement> }
    const element = createElement('e-vis', true)
    registry.elements.set(element.id, element)

    const payloads: LayerVisibilityChangedPayload[] = []
    host.on('layer:visibility-change', (payload) => payloads.push(payload))

    const wrapper = mount(LayerPanel, {
      props: { host },
      global: { stubs: stubIcons() },
    })
    await nextTick()

    const toggleButton = wrapper
      .findAll('button')
      .find((b) => /隐藏/.test(b.attributes('title') ?? ''))
    expect(toggleButton).toBeDefined()
    await toggleButton!.trigger('click')
    await nextTick()

    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
      elementId: 'e-vis',
      visible: false,
    })
    expect(typeof payloads[0]?.timestamp).toBe('number')

    wrapper.unmount()
  })

  it('emits layer:visibility-change with visible=true when toggling a hidden element', async () => {
    const host = createEditorHost()
    const registry = host.getPlugin('graphic-registry-plugin') as { elements: Map<string, IGraphicElement> }
    const element = createElement('e-hidden', false)
    registry.elements.set(element.id, element)

    const payloads: LayerVisibilityChangedPayload[] = []
    host.on('layer:visibility-change', (payload) => payloads.push(payload))

    const wrapper = mount(LayerPanel, {
      props: { host },
      global: { stubs: stubIcons() },
    })
    await nextTick()

    const toggleButton = wrapper
      .findAll('button')
      .find((b) => /显示/.test(b.attributes('title') ?? ''))
    expect(toggleButton).toBeDefined()
    await toggleButton!.trigger('click')
    await nextTick()

    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
      elementId: 'e-hidden',
      visible: true,
    })

    wrapper.unmount()
  })
})