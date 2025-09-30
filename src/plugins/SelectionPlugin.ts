import { EditorEvents } from '@/types/EventTypes'
import { BasePlugin } from '../styles/BasePlugin'
import type { IGraphicElement, Point2D } from '../types'

export class SelectionPlugin extends BasePlugin {
  public name = 'selection'
  public version = '1.0.0'

  public isSelecting: boolean = false
  public selectionStart: Point2D = { x: 0, y: 0 }
  public selectionEnd: Point2D = { x: 0, y: 0 }
  public selectionElements: Set<string> = new Set()
  public mouseDownInElement: IGraphicElement | null = null

  protected onInstall(): void {
    if (!this.host) return
    // 注册事件监听
    this.host.on('canvas:mousedown', this.handleMouseDown.bind(this))
    this.host.on('canvas:mousemove', this.handleMouseMove.bind(this))
    this.host.on('canvas:mouseup', this.handleMouseUp.bind(this))
    this.host.on('canvas:click', this.handleClick.bind(this))
    this.host.on('element:added', this.handleElementAdded.bind(this))
    this.host.on('element:removed', this.handleElementRemoved.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off('canvas:mousedown', this.handleMouseDown.bind(this))
    this.host.off('canvas:mousemove', this.handleMouseMove.bind(this))
    this.host.off('canvas:mouseup', this.handleMouseUp.bind(this))
    this.host.off('canvas:click', this.handleClick.bind(this))
    this.host.off('element:added', this.handleElementAdded.bind(this))
    this.host.off('element:removed', this.handleElementRemoved.bind(this))
  }

  private handleClick(point: Point2D): void {
    // 如果正在用进行范围选择，则不做任何操作
    if (this.isSelecting) {
      return
    }
    if (this.mouseDownInElement) {
      if (!this.selectionElements.has(this.mouseDownInElement.id)) {
        this.clearSelection()
        this.selectElement(this.mouseDownInElement.id)
      }
    }
  }

  private handleMouseDown(point: Point2D): void {
    if (!this.host || this.host.getState().currentTool !== 'select') return
    this.selectionStart = point
    // 检查是否点击了元素
    this.mouseDownInElement = this.findElementAtPoint(point)
    // 如果点击的是图形则不做任何事情
    if (this.mouseDownInElement) {
      return
    }
    this.isSelecting = true
  }

  private handleMouseMove(point: Point2D): void {
    // 如果没有开始选择，则不做任何操作
    if (!this.isSelecting || !this.host) return
    this.selectionEnd = point
  }

  private handleMouseUp(point: Point2D): void {
    // 如果没有开始选择，则不做任何操作
    if (!this.isSelecting) {
      return
    }
    this.isSelecting = false
    const elementsInSelection = this.findElementsInRect(this.selectionStart, this.selectionEnd)
    this.updateSelection(elementsInSelection.map((el) => el.id))
  }

  private handleElementAdded(element: IGraphicElement): void {
    // 新添加的元素 默认选中
    // this.selectElement(element.id)
  }

  private handleElementRemoved(element: IGraphicElement): void {
    this.deselectElement(element.id)
  }

  private findElementAtPoint(point: Point2D): IGraphicElement | null {
    // 实现点选逻辑
    if (!this.host) return null
    // 简化实现：遍历所有元素检查点是否在边界框内
    for (const element of this.host.getElements()) {
      const bbox = element.getBoundingBox()
      if (
        point.x >= bbox.x &&
        point.x <= bbox.x + bbox.width &&
        point.y >= bbox.y &&
        point.y <= bbox.y + bbox.height
      ) {
        return element
      }
    }
    return null
  }

  private findElementsInRect(start: Point2D, end: Point2D): IGraphicElement[] {
    // 实现框选逻辑
    if (!this.host) return []

    const elements: IGraphicElement[] = []
    const rect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }

    // 简化实现：检查元素边界框是否与选择矩形相交
    for (const element of this.host.getElements()) {
      const bbox = element.getBoundingBox()
      if (this.rectIntersect(rect, bbox)) {
        elements.push(element)
      }
    }
    return elements
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

  private selectElement(elementId: string): void {
    this.selectionElements.add(elementId)
    this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
    this.updateHostSelection()
  }

  private deselectElement(elementId: string): void {
    this.selectionElements.delete(elementId)
    this.updateHostSelection()
  }

  private clearSelection(): void {
    this.selectionElements.clear()
    this.updateHostSelection()
  }

  private updateSelection(elementIds: string[]): void {
    this.selectionElements = new Set(elementIds)
    this.host?.emit(EditorEvents.SELECTION_CHANGED, this.selectionElements)
    this.updateHostSelection()
  }

  private updateHostSelection(): void {
    if (!this.host) return
    this.host.setState({
      selectedElementIds: Array.from(this.selectionElements),
    })
  }
}
