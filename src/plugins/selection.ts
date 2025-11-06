import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D } from '../types'
import type { ElementManagerPlugin } from './element-manager'

export class SelectionPlugin extends BasePlugin {
  public name = 'selection-plugin'
  public version = '1.0.0'

  public isSelecting: boolean = false
  public selectionStart: Point2D = { x: 0, y: 0 }
  public selectionEnd: Point2D = { x: 0, y: 0 }
  public selectionElements: Map<string, IGraphicElement> = new Map()
  public mouseDownInElement: IGraphicElement | null = null
  private elementsPlugin: ElementManagerPlugin | null = null

  protected onInstall(): void {
    if (!this.host) return
    this.elementsPlugin = this.host.getPlugin('element-manager-plugin') as ElementManagerPlugin

    // 注册事件监听
    this.host.on(EditorEvents.CANVAS_MOUSE_DOWN, this.handleMouseDown.bind(this))
    this.host.on(EditorEvents.CANVAS_MOUSE_MOVE, this.handleMouseMove.bind(this))
    this.host.on(EditorEvents.CANVAS_MOUSE_UP, this.handleMouseUp.bind(this))
    this.host.on(EditorEvents.ELEMENT_ADDED, this.handleElementAdded.bind(this))
    this.host.on(EditorEvents.ELEMENT_REMOVED, this.handleElementRemoved.bind(this))
    this.host.on(EditorEvents.CANVAS_MOUSE_LEAVE, this.handleMouseUp.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off(EditorEvents.CANVAS_MOUSE_DOWN, this.handleMouseDown.bind(this))
    this.host.off(EditorEvents.CANVAS_MOUSE_MOVE, this.handleMouseMove.bind(this))
    this.host.off(EditorEvents.CANVAS_MOUSE_UP, this.handleMouseUp.bind(this))
    this.host.off(EditorEvents.ELEMENT_ADDED, this.handleElementAdded.bind(this))
    this.host.off(EditorEvents.ELEMENT_REMOVED, this.handleElementRemoved.bind(this))
    this.host.on(EditorEvents.CANVAS_MOUSE_LEAVE, this.handleMouseUp.bind(this))
  }

  private handleMouseDown(event: any): void {
    if (!this.host || this.host.getState().currentTool !== 'select') return
    this.selectionStart = event.point
    this.selectionEnd = event.point
    // 如果点击的是不是元素则开始范围选择
    const clickEl = this.getClickElement(event)
    if (!clickEl) {
      this.isSelecting = true
      this.mouseDownInElement = null
    } else {
      this.mouseDownInElement = clickEl
    }
  }

  private handleMouseMove(event: any): void {
    // 如果没有开始选择，则不做任何操作
    if (!this.isSelecting || !this.host) return
    this.selectionEnd = event.point
  }

  private handleMouseUp(event: any): void {
    // 如果开始范围选择 则框选
    if (this.isSelecting) {
      // 根据框选的范围进行选
      this.selectionElements = this.findElementsInRect(this.selectionStart, this.selectionEnd)
      this.isSelecting = false
      this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
    } else if (this.mouseDownInElement && !this.selectionElements.has(this.mouseDownInElement.id)) {
      // 点击的是元素且为为选择状态则清空选择后单选该元素
      this.selectionElements.clear()
      this.selectionElements.set(this.mouseDownInElement.id, this.mouseDownInElement)
      this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
    }
  }

  private handleElementAdded(element: IGraphicElement): void {
    // 新添加的元素 默认选中 延迟选中 以便画布刷新
    setTimeout(() => {
      this.selectionElements.clear()
      this.selectionElements.set(element.id, element)
      this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
    }, 200)
  }

  private handleElementRemoved(element: IGraphicElement): void {
    this.deselectElement(element.id)
  }

  private findElementsInRect(start: Point2D, end: Point2D): Map<string, IGraphicElement> {
    // 实现框选逻辑
    if (!this.host) return new Map()

    const elements: Map<string, IGraphicElement> = new Map()
    const rect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }

    // 简化实现：检查元素边界框是否与选择矩形相交
    this.elementsPlugin?.elements.forEach((element) => {
      // 从内容区查找KONVA SHAPE元素 以便获得在画布的绝对坐标
      const shape = this.host?.contentLayer?.getNode().findOne('#' + element.id)
      if (shape) {
        const absPos = shape?.getAbsolutePosition()
        const bbox = element.getBoundingBox()
        bbox.x = absPos.x
        bbox.y = absPos.y
        if (!element.locked && element.visible && this.rectIntersect(rect, bbox)) {
          elements.set(element.id, element)
        }
      }
    })
    return elements
  }

  /* 获取点击的元素 */
  private getClickElement(event: any): IGraphicElement | undefined {
    const elementId = event.target.attrs.id
    if (elementId) {
      return this.elementsPlugin?.getElement(elementId)
    }
    return undefined
  }

  // 识别两个矩形是否相交 暂不考虑角度
  private rectIntersect(rect1: any, rect2: any): boolean {
    return !(
      rect2.x > rect1.x + rect1.width ||
      rect2.x + rect2.width < rect1.x ||
      rect2.y > rect1.y + rect1.height ||
      rect2.y + rect2.height < rect1.y
    )
  }

  public selectElement(element: IGraphicElement): void {
    this.selectionElements.set(element.id, element)
    this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
  }

  public deselectElement(elementId: string): void {
    this.selectionElements.delete(elementId)
    this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
  }

  public clearSelection(): void {
    this.selectionElements.clear()
    this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
  }

  public selectElementByIds(ids: string[]): void {
    this.selectionElements.clear()
    ids.forEach((id) => {
      const element = this.elementsPlugin?.getElement(id)
      if (element) {
        this.selectionElements.set(element.id, element)
      }
    })
  }
}
