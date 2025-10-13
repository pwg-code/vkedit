import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { SelectionPlugin } from '@/plugins'
export class ClearSelectionCommand extends BaseCommand {
  public name = 'CLEAR_SELECTION'
  private previousSelection: Map<string, IGraphicElement> = new Map()
  selectionPlugin: SelectionPlugin | null
  constructor(private host: IEditorHost) {
    super('清空选择')
    this.selectionPlugin = host.getPlugin<SelectionPlugin>('selection')
  }

  execute(): void {
    this.previousSelection = new Map(this.selectionPlugin?.selectionElements)
    this.selectionPlugin?.selectionElements.clear()
    this.host.emit(EditorEvents.SELECTION_CHANGED, this.selectionPlugin?.selectionElements)
  }

  undo(): void {
    if (this.selectionPlugin) {
      this.selectionPlugin.selectionElements = new Map(this.previousSelection)
      this.host.emit(EditorEvents.SELECTION_CHANGED, this.selectionPlugin.selectionElements)
    }
  }
}
