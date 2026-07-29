import { BasePlugin } from '@/types/base-plugin'
import { markRaw, type Component } from 'vue'
import type { IGraphicElement } from '@/types'
import type { GraphicTypeRegistration, PropertyPanelRegistration } from '@/types/graphic-plugin'

function rawComponent<T extends Component | undefined>(comp: T): T {
  return (comp ? markRaw(comp) : comp) as T
}

export interface ToolDescriptor {
  type: string
  iconComponent: Component
  typeDisplayName: string
  createElement: () => IGraphicElement
}

export class GraphicRegistryPlugin extends BasePlugin {
  public name = 'graphic-registry-plugin'
  public version = '1.0.0'

  public elements: Map<string, IGraphicElement> = new Map()
  private graphics: Map<string, GraphicTypeRegistration> = new Map()
  private tools: Map<string, { type: string; render: () => Component }> = new Map()
  private propertyPanels: PropertyPanelRegistration[] = []

  protected onInstall(): void {
    if (!this.host) return

    this.host.on('graphic:registered', (data) => {
      const existing = this.graphics.get(data.type)
      this.graphics.set(data.type, {
        type: data.type,
        render: data.render,
        createElement: existing?.createElement ?? (() => { throw new Error(`Element type ${data.type} is not registered`) }),
        iconComponent: rawComponent(data.iconComponent ?? existing?.iconComponent),
        typeDisplayName: data.typeDisplayName ?? existing?.typeDisplayName,
      })
    })

    this.host.on('graphic:unregistered', (data) => {
      this.graphics.delete(data.type)
    })

    this.host.on('graphic-tool:registered', (data) => {
      this.tools.set(data.type, { type: data.type, render: data.render })
    })

    this.host.on('graphic-tool:unregistered', (data) => {
      this.tools.delete(data.type)
    })

    this.host.on('element:registered', (data) => {
      const existing = this.graphics.get(data.type)
      this.graphics.set(data.type, {
        type: data.type,
        render: existing?.render ?? (() => { throw new Error(`Graphic type ${data.type} is not registered`) }),
        createElement: data.createElement,
        iconComponent: existing?.iconComponent,
        typeDisplayName: existing?.typeDisplayName,
      })
    })

    this.host.on('property-panel:registered', (data) => {
      this.propertyPanels.push(data)
    })

    this.host.on('property-panel:unregistered', (data) => {
      this.propertyPanels = this.propertyPanels.filter((p) => p !== data)
    })
  }

  protected onUninstall(): void {
    this.graphics.clear()
    this.tools.clear()
    this.propertyPanels = []
    this.elements.clear()
  }

  getElementComponent(type: string): Component {
    const graphic = this.graphics.get(type)
    if (graphic) {
      return rawComponent(graphic.render())
    }
    throw new Error(`未找到类型为 ${type} 的图形组件`)
  }

  getTypeMeta(type: string): { iconComponent?: Component; typeDisplayName?: string } | undefined {
    const graphic = this.graphics.get(type)
    if (!graphic) return undefined
    return { iconComponent: rawComponent(graphic.iconComponent), typeDisplayName: graphic.typeDisplayName }
  }

  getToolList(): ToolDescriptor[] {
    return Array.from(this.graphics.values())
      .filter((g): g is GraphicTypeRegistration & { iconComponent: Component } => !!g.iconComponent)
      .map((g) => ({
        type: g.type,
        iconComponent: rawComponent(g.iconComponent),
        typeDisplayName: g.typeDisplayName ?? g.type,
        createElement: g.createElement,
      }))
  }

  getToolComponent(type: string): Component {
    const toolData = this.tools.get(type)
    if (toolData) {
      return rawComponent(toolData.render())
    }
    throw new Error(`未找到类型为 ${type} 的图形工具组件`)
  }

  getPanelsBySelection(selection: IGraphicElement[]): Component[] {
    if (selection.length === 0) return []
    if (selection.length === 1) {
      return this.getPanelsByType(selection[0].type)
    }
    return this.getPanelsByMultipleSelect(selection)
  }

  private getPanelsByType(type: string | undefined): Component[] {
    if (!type) return []
    const panels: Component[] = []
    this.propertyPanels.forEach((panel) => {
      if (panel.isPublic || panel.graphicTypes.includes(type)) {
        panels.push(rawComponent(panel.render()))
      }
    })
    return panels
  }

  private getPanelsByMultipleSelect(selectionElements: IGraphicElement[]): Component[] {
    const panels = new Map<string, Component[]>()
    selectionElements.forEach((value) => {
      if (!panels.has(value.type)) {
        panels.set(value.type, this.getPanelsByType(value.type))
      }
    })
    return this.findCommonElements(...Array.from(panels.values()))
  }

  private findCommonElements<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return []
    return arrays.reduce((acc, curr) => acc.filter((item) => curr.includes(item)))
  }

  getCanvasPanels(): Component[] {
    return Array.from(this.propertyPanels.values())
      .filter((p) => p.isCanvas)
      .map((p) => rawComponent(p.render()))
  }

  addElement(element: IGraphicElement): void {
    if (element.zIndex === 0 && this.elements.size > 0) {
      let max = -1
      this.elements.forEach((e) => {
        if (e.zIndex > max) max = e.zIndex
      })
      element.zIndex = max + 1
    }
    this.elements.set(element.id, element)
    this.host?.emit('element:added', {
      element,
      elementId: element.id,
      timestamp: Date.now(),
      source: 'graphic-registry-plugin',
    })
  }

  removeElement(elementId: string): void {
    const element = this.elements.get(elementId)
    if (element) {
      this.elements.delete(elementId)
      this.host?.emit('element:removed', {
        element,
        elementId: element.id,
        timestamp: Date.now(),
        source: 'graphic-registry-plugin',
      })
    }
  }

  getElement<T extends IGraphicElement = IGraphicElement>(elementId: string): T
  getElement(elementId: string, type?: string): IGraphicElement {
    const el = this.elements.get(elementId)
    if (!el) {
      throw new Error(`Element with ID ${elementId} does not exist.`)
    }
    return el as any
  }

  getAllElements<T extends IGraphicElement = IGraphicElement>(): T[]
  getAllElements(type?: string): IGraphicElement[] {
    const arr = Array.from(this.elements.values())
    if (type) {
      return arr.filter((e) => e.type === type) as any
    }
    return arr as any
  }

  createElement(type: string): IGraphicElement {
    const graphic = this.graphics.get(type)
    if (graphic) {
      return graphic.createElement()
    }
    throw new Error(`Element type ${type} is not registered.`)
  }

  getOrderedElements(order: 'ascending' | 'descending' = 'descending'): IGraphicElement[] {
    const arr = Array.from(this.elements.values())
    const idxMap = new Map<string, number>()
    arr.forEach((e, i) => idxMap.set(e.id, i))
    const dir = order === 'ascending' ? 1 : -1
    arr.sort((a, b) => {
      if (a.zIndex !== b.zIndex) return (a.zIndex - b.zIndex) * dir
      const ai = idxMap.get(a.id) ?? 0
      const bi = idxMap.get(b.id) ?? 0
      return (ai - bi) * dir
    })
    return arr
  }

  normalizeZIndices(): void {
    const ordered = this.getOrderedElements()
    const len = ordered.length
    ordered.forEach((e, i) => {
      e.zIndex = len - 1 - i
    })
  }
}

declare module '@/types' {
  interface PluginMap {
    'graphic-registry-plugin': GraphicRegistryPlugin
  }
}
