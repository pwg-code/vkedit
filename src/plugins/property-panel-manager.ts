import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, PropertyRegisteredPanelEventData } from '../types'
import type { Component } from 'vue'

export class PropertyPanelManagerPlugin extends BasePlugin {
  public name = 'property-panel-manager-plugin'
  public version = '1.0.0'
  public propertyPanels: PropertyRegisteredPanelEventData[] = []

  protected onInstall(): void {
    if (!this.host) return
    this.host.on('property-panel:registered', (data) => this.propertyPanels.push(data))
  }

  protected onUninstall(): void {
    if (!this.host) return
    this.host.off(
      'property-panel:unregistered',
      (data) => (this.propertyPanels = this.propertyPanels.filter((d) => d !== data)),
    )
  }

  // 根据选中的元素获取面板
  getPanelsBySelection(selection: IGraphicElement[]): Component[] {
    if (selection.length === 0) return []
    const panels: Component[] = []
    if (selection.length === 1) {
      // 单选
      return this.getPanelsByType(selection[0].type)
    }
    // 多选
    return this.getPanelsByMultipleSelect(selection)
  }

  // 按类型选择面
  private getPanelsByType(type: string | undefined): Component[] {
    if (!type) return []
    const panels: Component[] = []

    // 遍历所有注册的面板
    this.propertyPanels.forEach((panel) => {
      if (panel.isPublic || panel.graphicTypes.includes(type)) {
        panels.push(panel.render())
      }
    })
    return panels
  }

  // 根据所选的多个元素 获取它们共有的属性面板
  private getPanelsByMultipleSelect(selectionElements: IGraphicElement[]): Component[] {
    const panels = new Map<string, Component[]>()
    selectionElements.forEach((value) => {
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
  getCanvasPanels(): Component[] {
    return Array.from(this.propertyPanels.values())
      .filter((p) => p.isCanvas)
      .map((p) => p.render())
  }
}

// 将 PropertyPanelManagerPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'property-panel-manager-plugin': PropertyPanelManagerPlugin
  }
}
