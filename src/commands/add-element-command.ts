import { BaseCommand } from './base-command'
import type { IGraphicElement } from '../types'
import { EditorHost } from '@/core'
import type { ICommand } from './i-command'
import type { ElementManagerPlugin } from '@/plugins'

export class AddElementCommand extends BaseCommand {
  public name = 'ADD_ELEMENT'
  private elementsPlugin: ElementManagerPlugin | null
  constructor(
    private element: IGraphicElement,
    private host: EditorHost,
  ) {
    super(`添加 ${element.type} 元素`)
    this.elementsPlugin = this.host.getPlugin('element-manager-plugin')
  }
  execute(): void {
    this.elementsPlugin?.addElement(this.element)
  }

  undo(): void {
    this.elementsPlugin?.removeElement(this.element.id)
    this.host.emit('element:removed', {
      element: this.element,
      elementId: this.element.id,
      timestamp: this.timestamp,
      source: 'AddElementCommand',
    })
  }

  canMergeWith(command: ICommand): boolean {
    return command instanceof AddElementCommand && Date.now() - command.timestamp < 1000
  }
}
