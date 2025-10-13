import { EditorEvents } from '@/types/EventTypes'
import { BasePlugin } from '../types/BasePlugin'
import type { IGraphicElement, IPropertyPanel, IPropertyPanelForGraphics } from '../types'
import type { SelectionPlugin } from './SelectionPlugin'
import type { GraphicTypesPlugin } from './GraphicTypesPlugin'
import type { Component } from 'vue'

export class PropertyPanelsPlugin extends BasePlugin {
  public name = 'property-panels'
  public version = '1.0.0'
  public propertyPanels: Map<string, IPropertyPanel> = new Map()
  public propertyPanelCanvas: Map<string, IPropertyPanel> = new Map()
  public propertyForGraphics: Map<string[], IPropertyPanelForGraphics> = new Map()
  public propertyPublic: Component[] = []

  protected onInstall(): void {
    if (!this.host) return
    this.host.on(EditorEvents.PROPERTY_PANEL_REGISTERED, this.handleRegistered.bind(this))
    this.host.on(
      EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED,
      this.handleRegisteredCanvas.bind(this),
    )
    this.host.on(
      EditorEvents.PROPERTY_PANEL_FOR_GRAPHICS_REGISTERED,
      this.handleRegisteredForGraphics.bind(this),
    )
    this.host.on(
      EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED,
      this.handleRegisteredPublic.bind(this),
    )
  }

  protected onUninstall(): void {
    if (!this.host) return
    this.host.off(EditorEvents.PROPERTY_PANEL_UNREGISTERED, this.handleRegistered.bind(this))
    this.host.off(
      EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED,
      this.handleRegisteredCanvas.bind(this),
    )
    this.host.off(
      EditorEvents.PROPERTY_PANEL_FOR_GRAPHICS_REGISTERED,
      this.handleRegisteredForGraphics.bind(this),
    )
    this.host.off(
      EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED,
      this.handleRegisteredPublic.bind(this),
    )
  }

  private handleRegistered(panel: IPropertyPanel) {
    this.propertyPanels.set(panel.type, panel)
  }

  private handleRegisteredCanvas(panel: IPropertyPanel) {
    this.propertyPanelCanvas.set(panel.type, panel)
  }

  private handleRegisteredForGraphics(panel: IPropertyPanelForGraphics) {
    this.propertyForGraphics.set(panel.forGraphics, panel)
  }

  private handleRegisteredPublic(panel: IPropertyPanel) {
    this.propertyPublic.push(panel)
  }

  // 根据选中的元素获取面板
  getPanelsBySelection(selection: Map<string, IGraphicElement>): Component[] {
    if (!selection) return this.getCanvasPanels()
    if (selection.size == 1) {
      // 单选
      return this.getPanelsByType(selection.entries().next().value?.[1].type)
    } else {
      // 多选
      return this.getPanelsByMultipleSelect(selection)
    }
  }

  // 按类型选择面
  private getPanelsByType(type: string | undefined): Component[] {
    if (!type) return []
    const panels: Component[] = []
    // 获取公共面板
    panels.push(...this.propertyPublic)
    // 再次从多用的属性面板里面找
    this.propertyForGraphics.forEach((value, key) => {
      if (key.includes(type)) {
        panels.push(value.getComponent())
      }
    })
    // 获取图形构造器提供的面板
    const panel = this.host
      ?.getPlugin<GraphicTypesPlugin>('graphic-types')
      ?.getElementPropertyPanel(type)
    if (panel) {
      panels.push(panel)
    }
    return panels
  }

  // 根据所选的多个元素 获取它们共有的属性面板
  private getPanelsByMultipleSelect(selectionElements: Map<string, IGraphicElement>): Component[] {
    const panels = new Map<string, Component[]>()
    selectionElements.forEach((value, key) => {
      if (!panels.has(value.type)) {
        panels.set(value.type, this.getPanelsByType(value.type))
      }
    })
    // 清洁 找出共有的
    return this.findCommonElements(...Array.from(panels.values()))
  }

  // 传入多个数组 找出共有的元素
  private findCommonElements<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return []
    return arrays.reduce((acc, curr) => acc.filter((item) => curr.includes(item)))
  }

  // 获取画布的属性面板
  getCanvasPanels() {
    return Array.from(this.propertyPanelCanvas.values())
  }
}
