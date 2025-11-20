import type { EditorHost } from '@/core'
import { BaseCommand } from './base-command'
import type { ICommand } from './i-command'

export class BatchCommand extends BaseCommand {
  public name = 'BATCH_COMMAND'
  private commands: ICommand[] = []
  constructor(
    host: EditorHost,
    commands: ICommand[] = [],
    description: string = '批量操作',
  ) {
    super(host, description)
    this.commands = [...commands]
  }

  execute(): void {
    this.host?.emit('property:batch-update-start', {
      timestamp: this.timestamp,
      source: 'batch-command',
    })

    this.commands.forEach((command) => {
      command.execute()
    })

    this.host?.emit('property:batch-update-end', {
      timestamp: this.timestamp,
      source: 'batch-command',
    })
  }

  undo(): void {
    this.host?.emit('property:batch-update-start', {
      timestamp: this.timestamp,
      source: 'batch-command-undo',
    })

    // 逆序执行撤销
    ;[...this.commands].reverse().forEach((command) => {
      command.undo()
    })

    this.host?.emit('property:batch-update-end', {
      timestamp: this.timestamp,
      source: 'batch-command-undo',
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
