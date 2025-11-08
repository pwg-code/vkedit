import { BasePlugin } from '../types/base-plugin'
import type { GraphicToolRegisteredEventData, IGraphicElement } from '../types'
import type { Component } from 'vue'

export class GraphicToolManagerPlugin extends BasePlugin {
  public name = 'graphic-tool-manager-plugin'
  public version = '1.0.0'
  public tools: Map<string, GraphicToolRegisteredEventData> = new Map()


  protected onInstall(): void {
    if (!this.host) return
    // 监听图形注册事件
    this.host.on('graphic-tool:registered', (data) => {
      this.tools.set(data.type, data)
    })
    // 监听图形注销事件
    this.host.on('graphic-tool:unregistered', (data) => {
      this.tools.delete(data.type)
    })
  }

  // 获取图形工具列表
  getToolList(): GraphicToolRegisteredEventData[] {
    return Array.from(this.tools.values())
  }

  // 获取图形工具组件
  getToolComponent(type: string): Component {
    const toolData = this.tools.get(type)
    if (toolData) {
      return toolData.render()
    }
    throw new Error(`未找到类型为 ${type} 的图形工具组件`)
  }
}
