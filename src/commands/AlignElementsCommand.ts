import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { ElementsPlugin } from '@/plugins'

export class AlignElementsCommand extends BaseCommand {
  public name = 'ALIGN_ELEMENTS'
  private previousPositions: Map<string, { x: number; y: number }> = new Map()

  constructor(
    private host: IEditorHost,
    private alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY',
    private elementIds: string[],
  ) {
    super(`对齐元素: ${alignment}`)

    // 保存原始位置
    this.elementIds.forEach((id) => {
      const element = this.host.getPlugin<ElementsPlugin>('elements')?.getElement(id)
      if (element) {
        this.previousPositions.set(id, { x: element.x, y: element.y })
      }
    })
  }

  execute(): void {
    this.alignElements()
    this.host.emit(EditorEvents.ELEMENTS_ALIGN, {
      alignment: this.alignment,
      elementIds: this.elementIds,
      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.restorePreviousPositions()
    this.host.emit(EditorEvents.ELEMENTS_ALIGN, {
      alignment: 'undo',
      elementIds: this.elementIds,
      timestamp: this.timestamp,
    })
  }

  private alignElements(): void {
    const elements = this.elementIds
      .map((id) => this.host.getPlugin<ElementsPlugin>('elements')?.getElement(id))
      .filter(Boolean) as IGraphicElement[]

    if (elements.length === 0) return

    switch (this.alignment) {
      case 'left':
        const minX = Math.min(...elements.map((el) => el.x))
        elements.forEach((el) => (el.x = minX))
        break

      case 'right':
        const maxX = Math.max(...elements.map((el) => el.x + (el as any).width))
        elements.forEach((el) => (el.x = maxX - (el as any).width))
        break

      case 'top':
        const minY = Math.min(...elements.map((el) => el.y))
        elements.forEach((el) => (el.y = minY))
        break

      case 'bottom':
        const maxY = Math.max(...elements.map((el) => el.y + (el as any).height))
        elements.forEach((el) => (el.y = maxY - (el as any).height))
        break

      case 'centerX':
        const centerX =
          elements.reduce((sum, el) => sum + el.x + (el as any).width / 2, 0) / elements.length
        elements.forEach((el) => (el.x = centerX - (el as any).width / 2))

        break
      case 'centerY':
        const centerY =
          elements.reduce((sum, el) => sum + el.y + (el as any).height / 2, 0) / elements.length
        elements.forEach((el) => (el.y = centerY - (el as any).height / 2))
        break
    }
  }

  private restorePreviousPositions(): void {
    this.elementIds.forEach((id) => {
      const element = this.host.getPlugin<ElementsPlugin>('elements')?.getElement(id)
      const previousPos = this.previousPositions.get(id)

      if (element && previousPos) {
        element.x = previousPos.x
        element.y = previousPos.y
      }
    })
  }
}
