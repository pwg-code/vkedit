import { BaseCommand } from './base-command'
import type { IGraphicElement } from '../types'
import { type EditorHost } from '@/core'
import type { SelectionPlugin } from '@/plugins'
export class ClearSelectionCommand extends BaseCommand {
  public name = 'CLEAR_SELECTION'
  private previousSelectionIds: string[] = []
  selectionPlugin: SelectionPlugin | null
  constructor(private host: EditorHost) {
    super('清空选择')
    this.selectionPlugin = host.getPlugin('selection-plugin')
  }

  execute(): void {
    this.previousSelectionIds = this.selectionPlugin?.getSelectionElementIds() || []
    this.selectionPlugin?.clearSelection()
    this.host.emit('selection:changed', {
      selection: [],
      timestamp: Date.now(),
      source: 'clear-selection-command-execute',
    })
  }

  undo(): void {
    if (this.selectionPlugin) {
      this.selectionPlugin.selectElementByIds(this.previousSelectionIds)
      this.host.emit('selection:changed', {
        selection: this.selectionPlugin.getSelectionElements(),
        timestamp: Date.now(),
        source: 'clear-selection-command-undo',
      })
    }
  }
}
