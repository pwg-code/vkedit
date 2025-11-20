import { BaseCommand } from './base-command'
import type { EditorHost } from '@/core'

export class ChangeLayerOrderCommand extends BaseCommand {
  public name = 'CHANGE_LAYER_ORDER'
  private previousOrder: Map<string, number> = new Map()

  constructor(
    host: EditorHost,
    private elementId: string,
    private direction: 'up' | 'down' | 'top' | 'bottom',
  ) {
    super(host, `调整图层顺序: ${direction}`)
  }

  execute(): void {
    // 保存当前顺序
    this.saveCurrentOrder()

    // 执行图层顺序调整
    this.changeLayerOrder()

    this.host.emit('elements:layer', {
      elementId: this.elementId,
      direction: this.direction,
      timestamp: this.timestamp,
      source: 'ChangeLayerOrderCommand',
    })
  }

  undo(): void {
    // 恢复之前的顺序
    this.restorePreviousOrder()
    this.host.emit('elements:layer', {
      elementId: this.elementId,
      direction: this.getReverseDirection(),
      timestamp: this.timestamp,
      source: 'ChangeLayerOrderCommand',
    })
  }

  private saveCurrentOrder(): void {
    // 这里需要实现保存当前图层顺序的逻辑
    // 简化实现
  }

  private changeLayerOrder(): void {
    // 这里需要实现调整图层顺序的逻辑
    // 简化实现
  }

  private restorePreviousOrder(): void {
    // 这里需要实现恢复图层顺序的逻辑
    // 简化实现
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
