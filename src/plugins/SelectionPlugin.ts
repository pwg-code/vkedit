import { BasePlugin } from '../styles/BasePlugin'
import type { IGraphicElement, Point2D } from '../types'

export class SelectionPlugin extends BasePlugin {
  public name = 'selection'
  public version = '1.0.0'

  private isSelecting: boolean = false
  private selectionStart: Point2D = { x: 0, y: 0 }
  private selectionElements: Set<string> = new Set()

  protected onInstall(): void {
    if (!this.host) return

    // 注册事件监听
    this.host.on('canvas:mousedown', this.handleMouseDown.bind(this))
    this.host.on('canvas:mousemove', this.handleMouseMove.bind(this))
    this.host.on('canvas:mouseup', this.handleMouseUp.bind(this))
    this.host.on('element:added', this.handleElementAdded.bind(this))
    this.host.on('element:removed', this.handleElementRemoved.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off('canvas:mousedown', this.handleMouseDown.bind(this))
    this.host.off('canvas:mousemove', this.handleMouseMove.bind(this))
    this.host.off('canvas:mouseup', this.handleMouseUp.bind(this))
    this.host.off('element:added', this.handleElementAdded.bind(this))
    this.host.off('element:removed', this.handleElementRemoved.bind(this))
  }

  private handleMouseDown(point: Point2D): void {
    if (!this.host || this.host.getState().currentTool !== 'select') return

    this.isSelecting = true
    this.selectionStart = point

    // 检查是否点击了元素
    const clickedElement = this.findElementAtPoint(point)

    if (clickedElement) {
      if (!this.selectionElements.has(clickedElement.id)) {
        this.clearSelection()
        this.selectElement(clickedElement.id)
      }
    } else {
      this.clearSelection()
    }
  }

  private handleMouseMove(point: Point2D): void {
    if (!this.isSelecting || !this.host) return
    // 实现框选逻辑
    const elementsInSelection = this.findElementsInRect(this.selectionStart, point)
    console.log('当前选中元素为', elementsInSelection)

    this.updateSelection(elementsInSelection.map((el) => el.id))
  }

  private handleMouseUp(point: Point2D): void {
    this.isSelecting = false
  }

  private handleElementAdded(element: IGraphicElement): void {
    // 新添加的元素
  }

  private handleElementRemoved(element: IGraphicElement): void {
    this.deselectElement(element.id)
  }

  private findElementAtPoint(point: Point2D): IGraphicElement | null {
    // 实现点选逻辑
    if (!this.host) return null

    // 简化实现：遍历所有元素检查点是否在边界框内
    for (const element of this.host.getSelectedElements()) {
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
      with: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }

    // 简化实现：检查元素边界框是否与选择矩形相交
    for (const element of this.host.getSelectedElements()) {
      const bbox = element.getBoundingBox()
      if (this.rectIntersect(rect, bbox)) {
        elements.push(element)
      }
    }
    return elements
  }

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
    this.updateHostSelection()
  }

  private updateHostSelection(): void {
    if (!this.host) return

    this.host.setState({
      selectedElementIds: Array.from(this.selectionElements),
    })
  }
}
