import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
export class RemoveElementCommand extends BaseCommand {
  public name = 'REMOVE_ELEMENT'
  private elementData: any
  constructor(
    private elementId: string,
    private host: IEditorHost,
  ) {
    super('删除元素')

    // 保存元素的序列化数据，用于撤销时恢复
    const element = this.host.getElement(elementId)
    if (element) {
      this.elementData = element.serialize()
    }
  }

  execute(): void {
    const element = this.host.getElement(this.elementId)
    if (element) {
      this.host.removeElement(this.elementId)
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
        this.host.addElement(element)
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
      const elementClass = this.getElementClass(data.type)
      if (!elementClass) return null
      const element = new elementClass(data.id, 0, 0)
      element.deserialize(data)
      return element
    } catch (error) {
      console.error('Failed to deserialize element:', error)
      return null
    }
  }

  private getElementClass(type: string): any {
    // 这里应该从插件系统获取对应的元素类
    const classMap: { [key: string]: any } = {
      rect: class MockRectElement {
        constructor(
          public id: string,
          public x: number,
          public y: number,
        ) {}
        serialize() {
          return {}
        }

        deserialize(data: any) {
          Object.assign(this, data)
        }
      },

      circle: class MockCircleElement {
        constructor(
          public id: string,
          public x: number,
          public y: number,
        ) {}
        serialize() {
          return {}
        }

        deserialize(data: any) {
          Object.assign(this, data)
        }
      },
    }

    return classMap[type]
  }
}
