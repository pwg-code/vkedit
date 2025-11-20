import type { EditorHost } from '@/core'
import type { ICommand } from './i-command'

export abstract class BaseCommand implements ICommand {
  public abstract name: string
  public timestamp: number = Date.now()
  public description?: string
  protected host: EditorHost
  constructor(host:EditorHost, description?: string) {
    this.description = description
    this.host = host
  }
  abstract execute(): void
  abstract undo(): void
  redo(): void {
    this.execute()
  }
  canMergeWith?(command: ICommand): boolean {
    return false
  }
  mergeWith?(command: ICommand): ICommand {
    return this
  }
  protected getCurrentTimestamp(): number {
    return Date.now()
  }
}
