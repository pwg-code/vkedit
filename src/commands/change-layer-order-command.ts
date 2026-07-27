import { BaseCommand } from './base-command'
import type { EditorHost } from '@/core'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import type { IGraphicElement } from '@/types/base'
import type { LayerOrderChangedPayload } from '@/types/event-data'

export class ChangeLayerOrderCommand extends BaseCommand {
  public name = 'CHANGE_LAYER_ORDER'
  private previousOrder: Map<string, number> = new Map()
  private elementsPlugin: GraphicRegistryPlugin | null

  constructor(
    host: EditorHost,
    private elementId: string,
    private direction: 'up' | 'down' | 'top' | 'bottom',
  ) {
    super(host, `调整图层顺序: ${direction}`)
    this.elementsPlugin = this.host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
  }

  execute(): void {
    // 保存当前顺序
    this.saveCurrentOrder()

    // 执行图层顺序调整
    this.changeLayerOrder()

    this.emitOrderChanged({
      elementId: this.elementId,
      direction: this.direction,
      elementIds: [this.elementId],
    })
  }

  undo(): void {
    // 恢复之前的顺序
    this.restorePreviousOrder()
    this.emitOrderChanged({
      elementId: this.elementId,
      direction: this.getReverseDirection(),
      elementIds: [this.elementId],
    })
  }

  private emitOrderChanged(
    payload: Pick<LayerOrderChangedPayload, 'elementId' | 'direction' | 'elementIds'>,
  ): void {
    this.host.emit('layer:order-changed', {
      ...payload,
      timestamp: this.timestamp,
      source: 'ChangeLayerOrderCommand',
    })
  }

  private saveCurrentOrder(): void {
    this.previousOrder.clear()
    this.elementsPlugin?.elements.forEach((e) => {
      this.previousOrder.set(e.id, e.zIndex)
    })
  }

  private changeLayerOrder(): void {
    const ordered = this.elementsPlugin?.getOrderedElements() ?? []
    if (ordered.length === 0) return
    const idx = ordered.findIndex((e: IGraphicElement) => e.id === this.elementId)
    if (idx === -1) return
    const target = ordered[idx]
    switch (this.direction) {
      case 'top':
        target.zIndex = ordered[0].zIndex + 1
        break
      case 'bottom':
        target.zIndex = ordered[ordered.length - 1].zIndex - 1
        break
      case 'up': {
        if (idx === 0) return
        const prev = ordered[idx - 1]
        const tmp = target.zIndex
        target.zIndex = prev.zIndex
        prev.zIndex = tmp
        break
      }
      case 'down': {
        if (idx === ordered.length - 1) return
        const next = ordered[idx + 1]
        const tmp = target.zIndex
        target.zIndex = next.zIndex
        next.zIndex = tmp
        break
      }
    }
  }

  private restorePreviousOrder(): void {
    this.previousOrder.forEach((z, id) => {
      const el = this.elementsPlugin?.elements.get(id)
      if (el) el.zIndex = z
    })
  }

  private getReverseDirection(): 'up' | 'down' | 'top' | 'bottom' {
    const reverseMap: { [key: string]: string } = {
      up: 'down',
      down: 'up',
      top: 'bottom',
      bottom: 'top',
    }

    return (reverseMap[this.direction] || this.direction) as 'up' | 'down' | 'top' | 'bottom'
  }
}
