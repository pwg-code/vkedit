import type { IEditorHost } from '@/types'
import { BaseCommand } from './BaseCommand'
import type { ICommand } from './ICommand'
import { EditorEvents } from '@/types/EventTypes'

export class BatchCommand extends BaseCommand {
  public name = 'BATCH_COMMAND'
  private commands: ICommand[] = []
  constructor(
    public host: IEditorHost,
    commands: ICommand[] = [],
    description: string = '批量操作',
  ) {
    super(description)
    this.commands = [...commands]
  }

  execute(): void {
    this.host?.emit(EditorEvents.PROPERTY_BATCH_UPDATE_START, {
      timestamp: this.timestamp,
    })

    this.commands.forEach((command) => {
      command.execute()
    })

    this.host?.emit(EditorEvents.PROPERTY_BATCH_UPDATE_END, {
      timestamp: this.timestamp,
      commandCount: this.commands.length,
    })
  }

  undo(): void {
    this.host?.emit(EditorEvents.PROPERTY_BATCH_UPDATE_START, {
      timestamp: this.timestamp,
    })

    // 逆序执行撤销
    ;[...this.commands].reverse().forEach((command) => {
      command.undo()
    })

    this.host?.emit(EditorEvents.PROPERTY_BATCH_UPDATE_END, {
      timestamp: this.timestamp,
      commandCount: this.commands.length,
    })
  }

  addCommand(command: ICommand): void {
    this.commands.push(command)
  }

  addCommands(commands: ICommand[]): void {
    this.commands.push(...commands)
  }

  getCommands(): ICommand[] {
    return [...this.commands]
  }

  isEmpty(): boolean {
    return this.commands.length === 0
  }

  getDescription(): string {
    if (this.description) return this.description
    if (this.commands.length === 1) {
      return this.commands[0].description || this.commands[0].name
    }
    return `批量操作 (${this.commands.length} 个命令)`
  }

  canMergeWith(command: ICommand): boolean {
    return false // 批量命令通常不合并
  }
}
