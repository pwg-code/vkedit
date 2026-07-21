import { BaseCommand } from './base-command'
import type { EditorHost } from '@/core'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'

/**
 * 批量重排命令：用于图层列表拖拽松手后一次性重建全局顺序。
 * 入参 newOrder 为元素 id 列表，按拖拽后的完整新顺序自顶到底层传入。
 * execute：按 newOrder 重新分配 zIndex，第 i 个元素 zIndex = newOrder.length - i（保证顶部最大）。
 * undo：恢复快照中保存的 previousOrder（原始全局 id → zIndex 映射）。
 */
export class ReorderElementsCommand extends BaseCommand {
  public name = 'REORDER_ELEMENTS'
  private elementsPlugin: GraphicRegistryPlugin | null
  private previousOrder: Map<string, number> = new Map()

  constructor(
    host: EditorHost,
    private newOrder: string[],
    description?: string,
  ) {
    super(host, description ?? `重排图层 (${newOrder.length} 项)`)
    this.elementsPlugin = this.host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
  }

  execute(): void {
    this.saveCurrentOrder()
    this.applyOrder(this.newOrder)
    this.host.emit('elements:reorder', {
      elementId: this.newOrder[0] ?? '',
      direction: 'top',
      newOrder: this.newOrder,
      timestamp: this.timestamp,
      source: 'ReorderElementsCommand',
    })
  }

  undo(): void {
    const ids = Array.from(this.previousOrder.keys())
    this.applyOrder(ids)
    this.host.emit('elements:reorder', {
      elementId: ids[0] ?? '',
      direction: 'top',
      newOrder: ids,
      timestamp: this.timestamp,
      source: 'ReorderElementsCommand',
    })
  }

  private saveCurrentOrder(): void {
    this.previousOrder.clear()
    this.elementsPlugin?.elements.forEach((e) => {
      this.previousOrder.set(e.id, e.zIndex)
    })
  }

  private applyOrder(order: string[]): void {
    if (!this.elementsPlugin) return
    const len = order.length
    order.forEach((id, i) => {
      const el = this.elementsPlugin?.elements.get(id)
      if (el) el.zIndex = len - i
    })
  }
}