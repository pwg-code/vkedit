import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '../types/base-plugin'
import type { IGraphicType, Point2D } from '../types'
import { AddElementCommand } from '@/commands'

export class GraphicTypeManagerPlugin extends BasePlugin {
  public name = 'graphic-type-manager-plugin'
  public version = '1.0.0'
  public graphicTypes: Map<string, IGraphicType> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    // 订阅图形插件注册  收集已订阅的插件
    this.host.on(EditorEvents.GRAPHIC_TYPE_REGISTERED, this.handleGraphicTypeRegistered.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    this.host.off(EditorEvents.GRAPHIC_TYPE_REGISTERED, this.handleGraphicTypeRegistered.bind(this))
  }

  handleGraphicTypeRegistered(graphic: IGraphicType) {
    if (this.graphicTypes.has(graphic.type)) {
      console.warn(graphic.type + '插件已注册!')
    } else {
      this.graphicTypes.set(graphic.type, graphic)
    }
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

  // 获取所有构造器
  getGraphicTypes() {
    return Array.from(this.graphicTypes.values())
  }

  // 获得组件图形
  getElementComponent(type: string) {
    const graphicType = this.graphicTypes.get(type)
    return graphicType?.render() || undefined
  }

  // 获得元素的属性面板
  getElementPropertyPanel(type: string) {
    const graphicType = this.graphicTypes.get(type)
    return graphicType?.renderPropertyPanel() || undefined
  }

  getGraphicType(type: string) {
    return this.graphicTypes.get(type)
  }
}
