import { BaseCommand } from './BaseCommand'
import type { IEditorHost } from '@/types'
import { EditorEvents } from '@/types/EventTypes'

export class SelectElementCommand extends BaseCommand {
  public name = 'SELECT_ELEMENT'

  constructor(
    private host: IEditorHost,
    private elementIds: string[],
    private previousElementIds: string[],
  ) {
    super('选择元素')
  }

  execute(): void {
    this.host.setState({
      selectedElementIds: this.elementIds,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.elementIds,
      previousSelectedIds: this.previousElementIds,
      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.host.setState({
      selectedElementIds: this.previousElementIds,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.previousElementIds,
      previousSelectedIds: this.elementIds,
      timestamp: this.timestamp,
    })
  }

  static createSelectionChange(
    host: IEditorHost,
    newSelection: string[],
    oldSelection: string[],
  ): SelectElementCommand {
    return new SelectElementCommand(host, newSelection, oldSelection)
  }
}
