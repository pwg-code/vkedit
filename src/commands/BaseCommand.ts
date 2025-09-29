import type { ICommand } from './ICommand'

export abstract class BaseCommand implements ICommand {
  public abstract name: string
  public timestamp: number = Date.now()
  public description?: string
  constructor(description?: string) {
    this.description = description
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
