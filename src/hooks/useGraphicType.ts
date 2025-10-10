/* 主要是订阅图形类的插件注册事件，用于创建图形 */

import { AddElementCommand } from '@/commands'
import type { IEditorHost, IGraphicType, Point2D } from '@/types'
import { EditorEvents } from '@/types/EventTypes'
import { onMounted, ref, watch } from 'vue'

export default function (host: IEditorHost) {
  const graphicTypes = ref(new Map<string, IGraphicType>())
  // 创建图形
  const onCreate = (type: string, point: Point2D) => {
    const graphicType = graphicTypes.value.get(type)
    if (graphicType) {
      const newElement = graphicType.createElement(point.x, point.y)
      // 使用命令添加元素
      const command = new AddElementCommand(newElement, host)
      host.executeCommand(command)
    }
  }

  // 创建图形
  const getElementComponent = (type: string) => {
    const graphicType = graphicTypes.value.get(type)
    return graphicType?.getComponent() || undefined
  }

  const getGraphicType = (type: string) => {
    return graphicTypes.value.get(type)
  }
  onMounted(() => {
    // 订阅图形插件注册  收集已订阅的插件
    host.on(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      graphicTypes.value.set(graphic.type, graphic)
    })

    // 订阅图形插件注册  收集已订阅的插件
    host.on(EditorEvents.GRAPHIC_TYPE_REGISTERED, (graphic: IGraphicType) => {
      graphicTypes.value.set(graphic.type, graphic)
    })

    // 卸载图形插件 移除
    host.on(EditorEvents.GRAPHIC_TYPE_UNREGISTERED, (graphic: IGraphicType) => {
      graphicTypes.value.delete(graphic.type)
    })
  })

  return { graphicTypes, onCreate, getElementComponent, getGraphicType }
}
