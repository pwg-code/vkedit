import { BaseCommand } from './base-command'
import type { IEditorState } from '@/types'
import type { EditorHost } from '@/core'
import type { ICommand } from './i-command'

export type CanvasPropertyPath = 'dpm' | 'width' | 'height'

export interface CanvasPropertySnapshot {
  dpm: number
  width: number
  height: number
  wmm: number
  hmm: number
}

export class UpdateCanvasPropertyCommand extends BaseCommand {
  public name = 'UPDATE_CANVAS_PROPERTY'
  private propertyPath: CanvasPropertyPath
  private oldState: CanvasPropertySnapshot
  private newStatus: Partial<IEditorState>

  constructor(
    host: EditorHost,
    propertyPath: CanvasPropertyPath,
    oldState: CanvasPropertySnapshot,
    newStatus: Partial<IEditorState>,
  ) {
    super(host, `更新画布属性 ${propertyPath}`)
    this.propertyPath = propertyPath
    this.oldState = { ...oldState }
    this.newStatus = { ...newStatus }
  }

  execute(): void {
    this.host.setStatus(this.newStatus)
  }

  undo(): void {
    this.host.setStatus(this.oldState)
  }

  canMergeWith(command: ICommand): boolean {
    if (!(command instanceof UpdateCanvasPropertyCommand)) return false
    if (command.propertyPath !== this.propertyPath) return false
    if (Date.now() - this.timestamp >= 1000) return false
    return true
  }

  mergeWith(command: ICommand): ICommand {
    const incoming = command as UpdateCanvasPropertyCommand
    return new UpdateCanvasPropertyCommand(
      this.host,
      this.propertyPath,
      this.oldState,
      incoming.newStatus,
    )
  }
}
