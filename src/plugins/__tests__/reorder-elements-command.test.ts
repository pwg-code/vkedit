import { describe, expect, it, vi } from 'vitest'
import { createEditorHost } from '@/create-host'
import { ReorderElementsCommand } from '@/commands/reorder-elements-command'
import type { IGraphicElement } from '@/types/base'
import type { LayerOrderChangedPayload } from '@/types/event-data'

function createElement(id: string, zIndex: number): IGraphicElement {
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
    visible: true,
    locked: false,
    draggable: true,
    resizable: true,
    zIndex,
    getBoundingBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    clone() {
      return createElement(this.id, this.zIndex)
    },
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
  }
  return element
}

function createHarness(): {
  host: ReturnType<typeof createEditorHost>
} {
  const host = createEditorHost()
  const registry = host.getPlugin('graphic-registry-plugin') as { elements: Map<string, IGraphicElement> }
  ;['e-0', 'e-1', 'e-2'].forEach((id, i) => {
    registry.elements.set(id, createElement(id, i))
  })
  return { host }
}

describe('ReorderElementsCommand / drag-sort layer:order-changed event', () => {
  it('emits layer:order-changed on execute with the full new order', () => {
    const { host } = createHarness()
    const payloads: LayerOrderChangedPayload[] = []
    host.on('layer:order-changed', (payload) => payloads.push(payload))

    const newOrder = ['e-2', 'e-0', 'e-1']
    const cmd = new ReorderElementsCommand(host, newOrder)
    cmd.execute()

    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
      elementIds: newOrder,
      newOrder,
      elementId: 'e-2',
      direction: 'top',
      source: 'ReorderElementsCommand',
    })
  })

  it('emits layer:order-changed on undo with the previous order restored', () => {
    const { host } = createHarness()
    const payloads: LayerOrderChangedPayload[] = []
    host.on('layer:order-changed', (payload) => payloads.push(payload))

    const newOrder = ['e-2', 'e-0', 'e-1']
    const cmd = new ReorderElementsCommand(host, newOrder)
    cmd.execute()
    cmd.undo()

    expect(payloads).toHaveLength(2)
    const previousOrder = ['e-0', 'e-1', 'e-2']
    expect(payloads[1]).toMatchObject({
      elementIds: previousOrder,
      newOrder: previousOrder,
      source: 'ReorderElementsCommand',
    })
  })

  it('does not emit the legacy elements:reorder event', () => {
    const { host } = createHarness()
    const legacySpy = vi.fn()
    host.on('elements:reorder', legacySpy)

    const cmd = new ReorderElementsCommand(host, ['e-2', 'e-1', 'e-0'])
    cmd.execute()
    cmd.undo()

    expect(legacySpy).not.toHaveBeenCalled()
  })
})