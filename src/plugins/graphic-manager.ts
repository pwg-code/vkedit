import { BasePlugin } from '../types/base-plugin'
import type { GraphicRegisteredEventData, IGraphicElement } from '../types'
import type { Component } from 'vue'

export class GraphicManagerPlugin extends BasePlugin {
  public name = 'graphic-manager-plugin'
  public version = '1.0.0'
  public graphics: Map<string, GraphicRegisteredEventData> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    // 监听图形注册事件
    this.host.on('graphic:registered', (data) => {
      this.graphics.set(data.type, data)
    })
    // 监听图形注销事件
    this.host.on('graphic:unregistered', (data) => {
      this.graphics.delete(data.type)
    })
  }

  // 根据元素类型渲染组件
  getElementComponent(type: string):Component {
    const graphic = this.graphics.get(type)
    if (graphic) {
      return graphic.render()
    }
    throw new Error(`未找到类型为 ${type} 的图形组件`)
  }
}
