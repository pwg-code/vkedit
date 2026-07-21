import { BaseCommand } from './base-command'
import type { EditorHost } from '@/core'
import type { IGraphicElement } from '@/types'
import { getElementAABB } from '@/utils/geometry'

export class DistributeElementsCommand extends BaseCommand {
  public name = 'DISTRIBUTE_ELEMENTS'
  private previousPositions: Map<string, { x: number; y: number }> = new Map()

  constructor(
    host: EditorHost,
    private direction: 'horizontal' | 'vertical',
    private elementIds: string[],
  ) {
    super(host, `分布元素: ${direction}`)

    const elementManager = this.host.getPlugin('graphic-registry-plugin')
    this.elementIds.forEach((id) => {
      const element = elementManager.elements.get(id)
      if (element) {
        this.previousPositions.set(id, { x: element.x, y: element.y })
      }
    })
  }

  execute(): void {
    this.distributeElements()
    this.host.emit('elements:distribute', {
      direction: this.direction,
      elementIds: this.elementIds,
      timestamp: this.timestamp,
      source: 'DistributeElementsCommand',
    })
  }

  undo(): void {
    this.restorePreviousPositions()
    this.host.emit('elements:distribute', {
      direction: this.direction,
      elementIds: this.elementIds,
      timestamp: this.timestamp,
      source: 'DistributeElementsCommand',
    })
  }

  private distributeElements(): void {
    const elementManager = this.host.getPlugin('graphic-registry-plugin')

    const elements = this.elementIds
      .map((id) => elementManager.elements.get(id))
      .filter((el): el is IGraphicElement => !!el && el.visible && !el.locked)

    if (elements.length < 3) return

    const boxes = elements.map((el) => ({
      element: el,
      aabb: getElementAABB({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        scaleX: el.scaleX,
        scaleY: el.scaleY,
      }),
    }))

    if (this.direction === 'horizontal') {
      boxes.sort((a, b) => a.aabb.left - b.aabb.left)
    } else {
      boxes.sort((a, b) => a.aabb.top - b.aabb.top)
    }

    const first = boxes[0]
    const last = boxes[boxes.length - 1]
    const middle = boxes.slice(1, -1)

    if (middle.length === 0) return

    if (this.direction === 'horizontal') {
      const availableSpace = last.aabb.left - first.aabb.right
      const middleTotalWidth = middle.reduce(
        (sum, b) => sum + (b.aabb.right - b.aabb.left),
        0,
      )
      const gap = (availableSpace - middleTotalWidth) / (boxes.length - 1)
      let currentX = first.aabb.right + gap
      for (const box of middle) {
        const offset = currentX - box.aabb.left
        box.element.x += offset
        currentX += box.aabb.right - box.aabb.left + gap
      }
    } else {
      const availableSpace = last.aabb.top - first.aabb.bottom
      const middleTotalHeight = middle.reduce(
        (sum, b) => sum + (b.aabb.bottom - b.aabb.top),
        0,
      )
      const gap = (availableSpace - middleTotalHeight) / (boxes.length - 1)
      let currentY = first.aabb.bottom + gap
      for (const box of middle) {
        const offset = currentY - box.aabb.top
        box.element.y += offset
        currentY += box.aabb.bottom - box.aabb.top + gap
      }
    }
  }

  private restorePreviousPositions(): void {
    const elementManager = this.host.getPlugin('graphic-registry-plugin')
    this.previousPositions.forEach((pos, id) => {
      const element = elementManager.elements.get(id)
      if (element) {
        element.x = pos.x
        element.y = pos.y
      }
    })
  }
}
