import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D, ElementEventData } from '../types'
import type { ElementManagerPlugin } from './element-manager'

export class SelectionPlugin extends BasePlugin {
  public name = 'selection-plugin'
  public version = '1.0.0'

  public isSelecting: boolean = false
  public selectionStart: Point2D = { x: 0, y: 0 }
  public selectionEnd: Point2D = { x: 0, y: 0 }
  // public selectionElements: Map<string, IGraphicElement> = new Map()
  // 私有属性 选中的元素ids
  private selectionIds: Set<string> = new Set()
  // 鼠标按下时按下的元素ID
  private mouseDownId: string | null = null
  // 元素管理插件
  private elementsPlugin: ElementManagerPlugin | null = null

  protected onInstall(): void {
    if (!this.host) return
    this.elementsPlugin = this.host.getPlugin('element-manager-plugin') as ElementManagerPlugin
    // 如果没获取到元素管理插件 则报错
    if (!this.elementsPlugin) {
      throw new Error('SelectionPlugin requires ElementManagerPlugin to be installed first.')
    }

    // 注册事件监听
    this.host.on('stage:mousedown', this.handleMouseDown.bind(this))
    this.host.on('stage:mousemove', this.handleMouseMove.bind(this))
    this.host.on('stage:mouseup', this.handleMouseUp.bind(this))
    this.host.on('element:added', this.handleElementAdded.bind(this))
    this.host.on('element:removed', this.handleElementRemoved.bind(this))
    this.host.on('stage:mouseleave', this.handleMouseUp.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off('stage:mousedown', this.handleMouseDown.bind(this))
    this.host.off('stage:mousemove', this.handleMouseMove.bind(this))
    this.host.off('stage:mouseup', this.handleMouseUp.bind(this))
    this.host.off('element:added', this.handleElementAdded.bind(this))
    this.host.off('element:removed', this.handleElementRemoved.bind(this))
    this.host.on('stage:mouseleave', this.handleMouseUp.bind(this))
  }

  private handleMouseDown(event: any): void {
    // 如果按下的不是左键则不做任何操作
    if (event.evt.button !== 0) return

    if (!this.host || this.host.status.currentTool !== 'select') return
    this.selectionStart = event.point
    this.selectionEnd = event.point
    // 如果点击的是不是元素则开始范围选择
    this.mouseDownId = this.getClickElementId(event)
    if (!this.mouseDownId) {
      this.isSelecting = true
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
      this.selectionIds = this.findElementsInRect(this.selectionStart, this.selectionEnd)
      this.isSelecting = false
      this.host?.emit('selection:changed', {
        selection: this.getSelectedElements(),
        source: 'selection-plugin',
        timestamp: Date.now(),
      })
    } else if (this.mouseDownId && !this.selectionIds.has(this.mouseDownId)) {
      // 点击的是元素且为为选择状态则清空选择后单选该元素
      this.selectionIds.clear()
      this.selectionIds.add(this.mouseDownId)
      this.host?.emit('selection:changed', {
        selection: this.getSelectedElements(),
        source: 'selection-plugin',
        timestamp: Date.now(),
      })
    }
  }

  // 根据id集合返回选中的元素数组
  private getSelectedElements(): IGraphicElement[] {
    const elements: IGraphicElement[] = []
    this.selectionIds.forEach((id) => {
      const element = this.elementsPlugin?.getElement(id)
      if (element) {
        elements.push(element)
      }
    })
    return elements
  }

  private handleElementAdded(data: ElementEventData): void {
    // 新添加的元素 默认选中 延迟选中 以便画布刷新
    setTimeout(() => {
      this.selectionIds.clear()
      this.selectionIds.add(data.element.id)
      this.host?.emit('selection:changed', {
        selection: [data.element],
        source: 'selection-plugin',
        timestamp: Date.now(),
      })
    }, 200)
  }

  private handleElementRemoved(data: ElementEventData): void {
    this.deselectElement(data.element.id)
  }

  private findElementsInRect(start: Point2D, end: Point2D): Set<string> {
    // 实现框选逻辑
    if (!this.host) return new Set()

    const elementIds: Set<string> = new Set()
    const rect = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    }

    // 简化实现：检查元素边界框是否与选择矩形相交
    this.elementsPlugin?.elements.forEach((element) => {
      if (this.host?.contentLayer === undefined) return
      // 从内容区查找KONVA SHAPE元素 以便获得在画布的绝对坐标
      const shape = this.host.contentLayer.getNode().findOne('#' + element.id)
      if (shape) {
        const absPos = shape?.getAbsolutePosition()
        const bbox = element.getBoundingBox()
        bbox.x = absPos.x
        bbox.y = absPos.y
        const hostZoom = this.host.status.zoom
        bbox.width = bbox.width * hostZoom
        bbox.height = bbox.height * hostZoom
        if (!element.locked && element.visible && this.rectIntersect(rect, bbox)) {
          elementIds.add(element.id)
        }
      }
    })
    return elementIds
  }

  /* 获取点击的元素 */
  private getClickElementId(event: any): string | null {
    const elementId = event.target.attrs.id
    if (elementId) {
      return elementId
    }
    return null
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
    this.selectionIds.add(element.id)
    this.host?.emit('selection:changed', {
      selection: this.getSelectedElements(),
      source: 'selection-plugin',
      timestamp: Date.now(),
    })
  }

  public deselectElement(elementId: string): void {
    this.selectionIds.delete(elementId)
    this.host?.emit('selection:changed', {
      selection: this.getSelectedElements(),
      source: 'selection-plugin',
      timestamp: Date.now(),
    })
  }

  public clearSelection(): void {
    this.selectionIds.clear()
    this.host?.emit('selection:changed', {
      selection: this.getSelectedElements(),
      source: 'selection-plugin',
      timestamp: Date.now(),
    })
  }

  public selectElementByIds(ids: string[]): void {
    this.selectionIds.clear()
    ids.forEach((id) => {
      const element = this.elementsPlugin?.getElement(id)
      if (element) {
        this.selectionIds.add(element.id)
      }
    })
  }

  // 获取当前选中的元素
  public getSelectionElements(): IGraphicElement[] {
    return this.getSelectedElements()
  }

  // 获取当前选中的元素ID
  public getSelectionElementIds(): string[] {
    return this.selectionIds.values() ? Array.from(this.selectionIds.values()) : []
  }

  // 获取当前选中的元素 返回第一个
  public getCurrentElement(): IGraphicElement | null {
    const elements = this.getSelectedElements()
    if (elements.length > 0) {
      return elements[0]
    }
    return null
  }
}

// 将 SelectionPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'selection-plugin': SelectionPlugin
  }
}
