import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D } from '../types'
import { RemoveElementCommand } from '@/commands'
import type { SelectionPlugin } from './selection-plugin'

export class ElementsPlugin extends BasePlugin {
  public name = 'elements'
  public version = '1.0.0'
  public elements: Map<string, IGraphicElement> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    // 监听画布键盘事件
    // this.host.on(EditorEvents.CANVAS_KEYDOWN, this.handleKeyDown.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    // this.host.off(EditorEvents.CANVAS_KEYDOWN, this.handleKeyDown.bind(this))
  }

  // 添加元素
  addElement(element: IGraphicElement): void {
    this.elements.set(element.id, element)
    this.host?.emit(EditorEvents.ELEMENT_ADDED, element)
  }

  // 移除元素
  removeElement(elementId: string): void {
    const element = this.elements.get(elementId)
    if (element) {
      this.elements.delete(elementId)
      this.host?.emit(EditorEvents.ELEMENT_REMOVED, element)
    }
  }

  getElement(elementId: string): IGraphicElement | undefined {
    return this.elements.get(elementId)
  }

  // 获取所有元素
  getAllElements(): IGraphicElement[] {
    return Array.from(this.elements.values())
  }
}
