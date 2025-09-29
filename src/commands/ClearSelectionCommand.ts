import { BaseCommand } from './BaseCommand'
import type { IEditorHost } from '../types'
import { EditorEvents } from '@/types/EventTypes'
export class ClearSelectionCommand extends BaseCommand {
  public name = 'CLEAR_SELECTION'
  private previousSelection: string[] = []
  constructor(private host: IEditorHost) {
    super('清空选择')
    this.previousSelection = [...host.getState().selectedElementIds]
  }

  execute(): void {
    this.host.setState({
      selectedElementIds: [],
    })

    this.host.emit(EditorEvents.SELECTION_CLEARED, {
      previousSelectedIds: this.previousSelection,
      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.host.setState({
      selectedElementIds: this.previousSelection,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.previousSelection,
      previousSelectedIds: [],
      timestamp: this.timestamp,
    })
  }
}
