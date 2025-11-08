import { BaseCommand } from './base-command'
import type { IGraphicElement } from '../types'
import { type EditorHost } from '@/core'
import type { SelectionPlugin } from '@/plugins'
export class ClearSelectionCommand extends BaseCommand {
  public name = 'CLEAR_SELECTION'
  private previousSelection: Map<string, IGraphicElement> = new Map()
  selectionPlugin: SelectionPlugin | null
  constructor(private host: EditorHost) {
    super('清空选择')
    this.selectionPlugin = host.getPlugin<SelectionPlugin>('selection-plugin')
  }

  execute(): void {
    this.previousSelection = new Map(this.selectionPlugin?.selectionElements)
    this.selectionPlugin?.selectionElements.clear()
    this.host.emit('selection:changed', {
      selection: [],
      timestamp: Date.now(),
      source: 'clear-selection-command-execute',
    })
  }

  undo(): void {
    if (this.selectionPlugin) {
      this.selectionPlugin.selectionElements = new Map(this.previousSelection)
      this.host.emit('selection:changed', {
        selection: Array.from(this.selectionPlugin.selectionElements.values()),
        timestamp: Date.now(),
        source: 'clear-selection-command-undo',
      })
    }
  }
}
