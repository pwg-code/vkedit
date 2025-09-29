export interface ICommand {
  name: string
  timestamp: number
  description?: string
  execute(): void
  undo(): void
  redo(): void
  canMergeWith?(command: ICommand): boolean
  mergeWith?(command: ICommand): ICommand
}

export interface ICommandConstructor {
  new (...args: any[]): ICommand
}
