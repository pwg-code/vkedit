import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D, ElementEventData } from '../types'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import { isClickOnTransformOverlay } from '@/utils/transform-overlay'

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
  // 点击与拖动的位移阈值（px），小于此值视为「点击」
  private static readonly CLICK_THRESHOLD = 3
  // 元素管理插件
  private elementsPlugin: GraphicRegistryPlugin | null = null

  protected onInstall(): void {
    if (!this.host) return
    this.elementsPlugin = this.host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
    // 如果没获取到元素管理插件 则报错
    if (!this.elementsPlugin) {
      throw new Error('SelectionPlugin requires ElementManagerPlugin to be installed first.')
    }

    // 注册事件监听
    this.host.on('stage:mousedown', this.handleMouseDown)
    this.host.on('stage:mousemove', this.handleMouseMove)
    this.host.on('stage:mouseup', this.handleMouseUp)
    this.host.on('element:added', this.handleElementAdded)
    this.host.on('element:removed', this.handleElementRemoved)
    // 鼠标移出画布：只清理框选草稿（DOM MouseEvent 不含 evt/point，避免复用 handleMouseUp 抛 TypeError）
    this.host.on('stage:mouseleave', this.endSelectionDraft)
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off('stage:mousedown', this.handleMouseDown)
    this.host.off('stage:mousemove', this.handleMouseMove)
    this.host.off('stage:mouseup', this.handleMouseUp)
    this.host.off('element:added', this.handleElementAdded)
    this.host.off('element:removed', this.handleElementRemoved)
    this.host.off('stage:mouseleave', this.endSelectionDraft)
  }

  private handleMouseDown = (event: any): void => {
    if (event.evt.button !== 0) return

    if (!this.host || this.host.status.currentTool !== 'select') return

    if (isClickOnTransformOverlay(event)) return

    this.selectionStart = event.point
    this.selectionEnd = event.point
    this.mouseDownId = this.getClickElementId(event)
    this.isSelecting = true
  }

  private handleMouseMove = (event: any): void => {
    // 如果没有开始选择，则不做任何操作
    if (!this.isSelecting || !this.host) return
    this.selectionEnd = event.point
  }

  private handleMouseUp = (event: any): void => {
    // 兜底守卫：若事件载荷不含 evt / point（异常混入的 DOM-only 事件），
    // 不进入 Konva 风格的处理分支，仅清理草稿态后返回，避免抛 TypeError。
    if (!event || !event.evt || !event.point) {
      this.endSelectionDraft()
      return
    }

    if (!this.isSelecting) {
      this.endSelectionDraft()
      return
    }

    const modifier = this.isModifierPressed(event.evt)
    const dragged = this.isDragged(event)

    if (dragged) {
      // 拖拽 → 框选（P1b/P2b/F3）
      const rectIds = this.findElementsInRect(this.selectionStart, this.selectionEnd)
      if (modifier) {
        // F3: Ctrl/Shift + 拖拽框选 → 累加（并集）
        rectIds.forEach((id) => this.selectionIds.add(id))
      } else {
        // P1b/P2b: 普通框选 → 替换选区
        this.selectionIds = rectIds
      }
      this.emitSelectionChanged()
    } else if (this.mouseDownId) {
      // 无拖拽 + 有按下元素 → 点选（F1/F2/F4/F5/P2a）
      const element = this.elementsPlugin?.elements.get(this.mouseDownId)
      // F6: 锁定/隐藏元素不可选，静默忽略（不清空已有选择）
      if (!element || element.locked || !element.visible) {
        this.endSelectionDraft()
        return
      }

      if (modifier) {
        // F1/F2: Ctrl/Cmd/Shift + 点击 → toggle 追加 / 减选
        if (this.selectionIds.has(this.mouseDownId)) {
          this.selectionIds.delete(this.mouseDownId)
        } else {
          this.selectionIds.add(this.mouseDownId)
        }
        this.emitSelectionChanged()
      } else {
        if (
          this.selectionIds.size > 1 &&
          this.selectionIds.has(this.mouseDownId)
        ) {
          // F4: 多选状态下普通点击已选元素 → 切换为单选
          this.selectionIds.clear()
          this.selectionIds.add(this.mouseDownId)
          this.emitSelectionChanged()
        } else if (!this.selectionIds.has(this.mouseDownId)) {
          // F5/P2a: 点击未选中元素 → 清空后单选
          this.selectionIds.clear()
          this.selectionIds.add(this.mouseDownId)
          this.emitSelectionChanged()
        }
        // else: 单选且已选中 → 保持不变（便于拖动）
      }
    } else {
      // 空白处点击无拖拽 → 清空选区
      this.selectionIds.clear()
      this.emitSelectionChanged()
    }

    this.endSelectionDraft()
  }

  /**
   * 清理框选 / 按下草稿状态（鼠标移出画布或异常事件触发时使用）。
   * 不会触发 selection:changed，也不访问 event.evt / event.point。
   */
  private endSelectionDraft = (): void => {
    this.isSelecting = false
    this.mouseDownId = null
  }

  // 判断是否按下修饰键 Ctrl/Cmd/Shift（三者等价，不区分）
  private isModifierPressed(evt: MouseEvent): boolean {
    return evt.ctrlKey || evt.metaKey || evt.shiftKey
  }

  // 判断从 mouseDown 到当前 mouseUp 是否发生拖动
  private isDragged(event: any): boolean {
    const dx = event.point.x - this.selectionStart.x
    const dy = event.point.y - this.selectionStart.y
    return Math.sqrt(dx * dx + dy * dy) > SelectionPlugin.CLICK_THRESHOLD
  }

  // 统一发出 selection:changed 事件
  private emitSelectionChanged(): void {
    this.host?.emit('selection:changed', {
      selection: this.getSelectedElements(),
      source: 'selection-plugin',
      timestamp: Date.now(),
    })
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

  private handleElementAdded = (data: ElementEventData): void => {
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

  private handleElementRemoved = (data: ElementEventData): void => {
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

  /* 获取点击的元素（向上遍历祖先，以支持 v-group 结构的元素命中 group 上的 id） */
  private getClickElementId(event: any): string | null {
    let node = event.target
    while (node) {
      const id = node.attrs?.id
      if (id) return id
      node = node.parent
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
    const hadSelection = this.selectionIds.size > 0
    this.selectionIds.clear()
    const payload = {
      selection: this.getSelectedElements(),
      source: 'selection-plugin',
      timestamp: Date.now(),
    }
    if (hadSelection) {
      this.host?.emit('selection:cleared', payload)
    }
    this.host?.emit('selection:changed', payload)
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
