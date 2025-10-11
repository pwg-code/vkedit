import { EditorEvents } from '@/types/EventTypes'
import { BasePlugin } from '../types/BasePlugin'
import type { IGraphicElement, IGraphicType, Point2D } from '../types'
import { AddElementCommand, RemoveElementCommand } from '@/commands'
import type { SelectionPlugin } from './SelectionPlugin'

export class GraphicTypesPlugin extends BasePlugin {
  public name = 'graphic-types'
  public version = '1.0.0'
  public graphicTypes: Map<string, IGraphicType> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    // 订阅图形插件注册  收集已订阅的插件
    this.host.on(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.set(graphic.type, graphic)
    })
    // 订阅图形插件注册  收集已订阅的插件
    this.host.on(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.set(graphic.type, graphic)
    })
    // 卸载图形插件 移除
    this.host.on(EditorEvents.GRAPHIC_TYPE_UNREGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.delete(graphic.type)
    })
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    this.host.off(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.set(graphic.type, graphic)
    })
    this.host.off(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.set(graphic.type, graphic)
    })
    this.host.off(EditorEvents.GRAPHIC_TYPE_UNREGISTERED, (graphic: IGraphicType) => {
      this.graphicTypes.delete(graphic.type)
    })
  }

  // 创建图形
  onCreate(type: string, point: Point2D) {
    if (!this.host) return
    const graphicType = this.graphicTypes.get(type)
    if (graphicType) {
      const newElement = graphicType.createElement(point.x, point.y)
      // 使用命令添加元素
      const command = new AddElementCommand(newElement, this.host)
      this.host.executeCommand(command)
    }
  }

  // 创建图形
  getElementComponent(type: string) {
    const graphicType = this.graphicTypes.get(type)
    return graphicType?.getComponent() || undefined
  }

  getGraphicType(type: string) {
    return this.graphicTypes.get(type)
  }
}
