import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types//EventTypes'

export class GroupElementsCommand extends BaseCommand {
  public name = 'GROUP_ELEMENTS'
  private groupElement: IGraphicElement | null = null
  private originalElements: IGraphicElement[] = []

  constructor(
    private host: IEditorHost,
    private elementIds: string[],
  ) {
    super('组合元素')

    this.originalElements = elementIds

      .map((id) => host.getElement(id))

      .filter(Boolean) as IGraphicElement[]
  }

  execute(): void {
    if (this.originalElements.length === 0) return

    // 创建组合元素

    this.groupElement = this.createGroupElement()

    // 移除原始元素

    this.originalElements.forEach((element) => {
      this.host.removeElement(element.id)
    })

    // 添加组合元素

    this.host.addElement(this.groupElement)

    this.host.emit(EditorEvents.ELEMENTS_GROUP, {
      elementIds: this.elementIds,

      groupId: this.groupElement.id,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    if (!this.groupElement) return

    // 移除组合元素

    this.host.removeElement(this.groupElement.id)

    // 恢复原始元素

    this.originalElements.forEach((element) => {
      this.host.addElement(element)
    })

    this.host.emit(EditorEvents.ELEMENTS_UNGROUP, {
      elementIds: this.elementIds,

      groupId: this.groupElement.id,

      timestamp: this.timestamp,
    })
  }

  private createGroupElement(): IGraphicElement {
    // 这里需要实现创建组合元素的逻辑

    // 简化实现，返回一个模拟的组合元素

    return {
      id: `group-${Date.now()}`,

      type: 'group',

      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,

      visible: true,
      locked: false,

      getComponent: () => ({ component: null }),

      getBoundingBox: () => ({ x: 0, y: 0, width: 0, height: 0 }),

      clone: () => this.createGroupElement(),

      serialize: () => ({}),

      deserialize: () => {},
    } as IGraphicElement
  }
}
