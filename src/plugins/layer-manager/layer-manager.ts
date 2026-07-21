import { BasePlugin } from '@/types/base-plugin'
import type { IGraphicElement } from '@/types'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import { ChangeLayerOrderCommand, ReorderElementsCommand } from '@/commands'

// 类型 → 中文名映射；缺省回落到 type 字符串本身
const TYPE_NAME_MAP: Record<string, string> = {
  rect: '矩形',
  text: '文本',
  line: '线条',
  table: '表格',
  qrcode: '二维码',
  qr: '二维码',
  barcode: '条形码',
  chart: '图表',
}

const AUTO_NAME_PATTERN = /^([^\s]+)\s+(\d+)$/u

export class LayerManagerPlugin extends BasePlugin {
  public name = 'layer-manager-plugin'
  public version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
  }

  protected onUninstall(): void {
    if (!this.host) return
  }

  // 获取元素类型的中文名
  getTypeDisplayName(type: string): string {
    return TYPE_NAME_MAP[type] ?? type
  }

  getElementDisplayName(element: IGraphicElement): string {
    // 1. 已有名称（用户自定义或之前自动分配的）→ 直接返回
    const customName = element.displayName
    if (typeof customName === 'string' && customName.trim().length > 0) {
      return customName
    }

    // 2. 首次需要名称 → 分配并存储固定名称，后续拖拽不再变化
    const elementsPlugin = this.host?.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
    const ordered = elementsPlugin?.getOrderedElements() ?? []
    const typeName = this.getTypeDisplayName(element.type)

    const usedNumbers = new Set<number>()
    for (const e of ordered) {
      if (e.type !== element.type) continue
      if (e.id === element.id) continue
      if (typeof e.displayName !== 'string' || e.displayName.trim().length === 0) continue
      const m = AUTO_NAME_PATTERN.exec(e.displayName)
      if (m && m[1] === typeName) {
        const num = Number.parseInt(m[2], 10)
        if (Number.isFinite(num) && num > 0) usedNumbers.add(num)
      }
    }

    let nextSeq = 1
    while (usedNumbers.has(nextSeq)) nextSeq++
    const autoName = `${typeName} ${nextSeq}`

    element.displayName = autoName

    return autoName
  }

  // 单元素四方向移动：上移/下移/置顶/置底（每次 = 1 条命令）
  moveLayer(elementId: string, direction: 'up' | 'down' | 'top' | 'bottom'): void {
    const cmd = new ChangeLayerOrderCommand(this.host, elementId, direction)
    this.host.executeCommand(cmd)
  }

  // 批量重排：传入拖拽后的完整新顺序 id 列表（自顶到底层），合并为 1 条命令
  reorder(newOrder: string[]): void {
    if (newOrder.length === 0) return
    const cmd = new ReorderElementsCommand(this.host, newOrder)
    this.host.executeCommand(cmd)
  }
}

declare module '@/types' {
  interface PluginMap {
    'layer-manager-plugin': LayerManagerPlugin
  }
}