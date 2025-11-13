import { BaseCommand } from './base-command'
import type { IGraphicElement } from '../types'
import { type EditorHost } from '@/core'
import type { ElementManagerPlugin, GraphicTypeManagerPlugin } from '@/plugins'
export class RemoveElementCommand extends BaseCommand {
  public name = 'REMOVE_ELEMENT'
  private elementData: any
  private elementsPlugin: ElementManagerPlugin | null

  constructor(
    private element: IGraphicElement,
    private host: EditorHost,
  ) {
    super('删除元素')
    this.elementsPlugin = host.getPlugin('element-manager-plugin')
    this.element = element
  }

  execute(): void {
    this.elementsPlugin?.removeElement(this.element.id)
    this.host.emit('element:removed', {
      element: this.element,
      elementId: this.element.id,
      timestamp: this.timestamp,
      source: 'remove-element-command-execute',
    })
  }

  undo(): void {
    this.elementsPlugin?.addElement(this.element)
    this.host.emit('element:added', {
      element: this.element,
      elementId: this.element.id,
      timestamp: this.timestamp,
      source: 'remove-element-command-undo',
    })
  }
}
