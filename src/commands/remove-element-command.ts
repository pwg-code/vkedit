import { BaseCommand } from './base-command'
import type { IEditorHost, IGraphicElement, IGraphicType } from '../types'
import { EditorEvents } from '@/types/event-types'
import type { ElementManagerPlugin, GraphicTypeManagerPlugin } from '@/plugins'
export class RemoveElementCommand extends BaseCommand {
  public name = 'REMOVE_ELEMENT'
  private elementData: any
  private elementsPlugin: ElementManagerPlugin | null

  constructor(
    private element: IGraphicElement,
    private host: IEditorHost,
  ) {
    super('删除元素')
    this.elementsPlugin = host.getPlugin<ElementManagerPlugin>('element-manager-plugin')
    this.element = element
  }

  execute(): void {
    this.elementsPlugin?.removeElement(this.element.id)
  }

  undo(): void {
    this.elementsPlugin?.addElement(this.element)
  }
}
