import { describe, expect, it, vi } from 'vitest'
import { createEditorHost } from '@/create-host'
import { ChangeLayerOrderCommand } from '@/commands/change-layer-order-command'
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

function createHarness(zIndices: number[] = [0, 1, 2]): {
  host: ReturnType<typeof createEditorHost>
} {
  const host = createEditorHost()
  const registry = host.getPlugin('graphic-registry-plugin') as { elements: Map<string, IGraphicElement> }
  zIndices.forEach((z, i) => {
    registry.elements.set(`e-${i}`, createElement(`e-${i}`, z))
  })
  return { host }
}

describe('ChangeLayerOrderCommand / layer:order-changed event', () => {
  it('emits layer:order-changed on execute with the moved element id and direction', () => {
    const { host } = createHarness([0, 1, 2])
    const payloads: LayerOrderChangedPayload[] = []
    host.on('layer:order-changed', (payload) => payloads.push(payload))

    const cmd = new ChangeLayerOrderCommand(host, 'e-1', 'top')
    cmd.execute()

    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
      elementIds: ['e-1'],
      elementId: 'e-1',
      direction: 'top',
      source: 'ChangeLayerOrderCommand',
    })
    expect(typeof payloads[0]?.timestamp).toBe('number')
  })

  it('emits layer:order-changed on undo with the reverse direction', () => {
    const { host } = createHarness([0, 1, 2])
    const payloads: LayerOrderChangedPayload[] = []
    host.on('layer:order-changed', (payload) => payloads.push(payload))

    const cmd = new ChangeLayerOrderCommand(host, 'e-0', 'up')
    cmd.execute()
    cmd.undo()

    expect(payloads).toHaveLength(2)
    expect(payloads[0]).toMatchObject({
      elementIds: ['e-0'],
      elementId: 'e-0',
      direction: 'up',
      source: 'ChangeLayerOrderCommand',
    })
    expect(payloads[1]).toMatchObject({
      elementIds: ['e-0'],
      elementId: 'e-0',
      direction: 'down',
      source: 'ChangeLayerOrderCommand',
    })
  })

  it('does not emit the legacy elements:layer event', () => {
    const { host } = createHarness([0, 1, 2])
    const legacySpy = vi.fn()
    host.on('elements:layer', legacySpy)

    const cmd = new ChangeLayerOrderCommand(host, 'e-0', 'down')
    cmd.execute()
    cmd.undo()

    expect(legacySpy).not.toHaveBeenCalled()
  })

  it('does not throw when the target element does not exist', () => {
    const { host } = createHarness([0, 1, 2])
    const cmd = new ChangeLayerOrderCommand(host, 'ghost', 'top')
    expect(() => cmd.execute()).not.toThrow()
    expect(() => cmd.undo()).not.toThrow()
  })
})