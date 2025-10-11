import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { ICommand } from './ICommand'
import type { ElementsPlugin } from '@/plugins'

export class AddElementCommand extends BaseCommand {
  public name = 'ADD_ELEMENT'
  private elementsPlugin: ElementsPlugin | null
  constructor(
    private element: IGraphicElement,
    private host: IEditorHost,
  ) {
    super(`添加 ${element.type} 元素`)
    this.elementsPlugin = this.host.getPlugin<ElementsPlugin>('elements')
  }
  execute(): void {
    this.elementsPlugin?.addElement(this.element)
    this.host.emit(EditorEvents.ELEMENT_ADDED, {
      element: this.element,
      elementId: this.element.id,
      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.elementsPlugin?.removeElement(this.element.id)
    this.host.emit(EditorEvents.ELEMENT_REMOVED, {
      element: this.element,
      elementId: this.element.id,
      timestamp: this.timestamp,
    })
  }

  canMergeWith(command: ICommand): boolean {
    return command instanceof AddElementCommand && Date.now() - command.timestamp < 1000
  }
}
