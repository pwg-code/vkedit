import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement, IGraphicType } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { ElementsPlugin, GraphicTypesPlugin } from '@/plugins'
export class RemoveElementCommand extends BaseCommand {
  public name = 'REMOVE_ELEMENT'
  private elementData: any
  private elementsPlugin: ElementsPlugin | null

  constructor(
    private elementId: string,
    private host: IEditorHost,
  ) {
    super('删除元素')
    this.elementsPlugin = host.getPlugin<ElementsPlugin>('elements')

    // 保存元素的序列化数据，用于撤销时恢复
    const element = this.elementsPlugin?.getElement(elementId)
    if (element) {
      this.elementData = element.serialize()
    }
  }

  execute(): void {
    const element = this.elementsPlugin?.getElement(this.elementId)
    if (element) {
      this.elementsPlugin?.removeElement(this.elementId)
      this.host.emit(EditorEvents.ELEMENT_REMOVED, {
        element,
        elementId: this.elementId,
        timestamp: this.timestamp,
      })
    }
  }

  undo(): void {
    if (this.elementData) {
      const element = this.deserializeElement(this.elementData)
      if (element) {
        this.elementsPlugin?.addElement(element)
        this.host.emit(EditorEvents.ELEMENT_ADDED, {
          element,
          elementId: element.id,
          timestamp: this.timestamp,
        })
      }
    }
  }

  private deserializeElement(data: any): IGraphicElement | null {
    try {
      // 这里需要根据元素类型创建对应的元素实例
      // 简化实现，实际应该根据类型映射到具体的元素类
      const graphicType = this.getElementClass(data.type)
      if (!graphicType) return null
      const element = graphicType.createElement(0, 0)
      element.deserialize(data)
      return element
    } catch (error) {
      console.error('Failed to deserialize element:', error)
      return null
    }
  }

  private getElementClass(type: string): IGraphicType | undefined {
    // 这里应该从插件系统获取对应的元素类
    const graphicTypesPlugin = this.host.getPlugin<GraphicTypesPlugin>('graphic-types')
    return graphicTypesPlugin?.getGraphicType(type)
  }
}
