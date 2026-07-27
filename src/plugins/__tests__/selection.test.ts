import { describe, expect, it, vi } from 'vitest'
import { EditorHost } from '@/core/editor-host'
import { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import { SelectionPlugin } from '@/plugins/selection'
import type { IGraphicElement } from '@/types/base'
import type { SelectionEventData } from '@/types/event-data'

vi.mock('@/core', () => ({}))
vi.mock('@/utils/transform-overlay', () => ({ isClickOnTransformOverlay: () => false }))

function createElement(id: string): IGraphicElement {
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
    zIndex: 0,
    getBoundingBox: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    clone: () => element,
    serialize: () => ({}),
    deserialize: () => undefined,
    updateProperty: () => undefined,
  }
  return element
}

function createHarness(): {
  host: EditorHost
  selection: SelectionPlugin
  elements: IGraphicElement[]
} {
  const host = new EditorHost()
  host.installPlugin('graphic-registry-plugin', GraphicRegistryPlugin)
  host.installPlugin('selection-plugin', SelectionPlugin)

  const registry = host.getPlugin<GraphicRegistryPlugin>('graphic-registry-plugin')
  const selection = host.getPlugin<SelectionPlugin>('selection-plugin')
  const elements = [createElement('element-1'), createElement('element-2')]
  elements.forEach((element) => registry.elements.set(element.id, element))

  return { host, selection, elements }
}

describe('SelectionPlugin.clearSelection', () => {
  it('emits cleared and changed once when a non-empty selection is cleared', () => {
    const { host, selection, elements } = createHarness()
    selection.selectElement(elements[0])
    selection.selectElement(elements[1])

    const events: string[] = []
    const clearedPayloads: SelectionEventData[] = []
    const changedPayloads: SelectionEventData[] = []
    host.on('selection:cleared', (payload) => {
      events.push('cleared')
      clearedPayloads.push(payload)
    })
    host.on('selection:changed', (payload) => {
      events.push('changed')
      changedPayloads.push(payload)
    })

    selection.clearSelection()

    expect(events).toEqual(['cleared', 'changed'])
    expect(clearedPayloads).toHaveLength(1)
    expect(changedPayloads).toHaveLength(1)
    expect(clearedPayloads[0]).toBe(changedPayloads[0])
    expect(changedPayloads[0]).toMatchObject({
      selection: [],
      source: 'selection-plugin',
    })
    expect(selection.getSelectionElementIds()).toEqual([])
    expect(selection.getSelectionElements()).toEqual([])
  })

  it('does not emit cleared again when clearSelection is repeated', () => {
    const { host, selection, elements } = createHarness()
    selection.selectElement(elements[0])
    selection.selectElement(elements[1])

    const clearedPayloads: SelectionEventData[] = []
    const changedPayloads: SelectionEventData[] = []
    host.on('selection:cleared', (payload) => clearedPayloads.push(payload))
    host.on('selection:changed', (payload) => changedPayloads.push(payload))

    selection.clearSelection()
    const stateAfterFirstClear = selection.getSelectionElementIds()
    selection.clearSelection()

    expect(clearedPayloads).toHaveLength(1)
    expect(changedPayloads).toHaveLength(2)
    expect(stateAfterFirstClear).toEqual([])
    expect(selection.getSelectionElementIds()).toEqual(stateAfterFirstClear)
    expect(selection.getSelectionElements()).toEqual([])
  })
})
