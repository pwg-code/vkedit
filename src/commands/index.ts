export * from './ICommand'
export * from './BaseCommand'
// 图形元素命令
export * from './AddElementCommand'
export * from './RemoveElementCommand'
export * from './TransformElementCommand'
export * from './UpdatePropertyCommand'
// 选择命令
export * from './ClearSelectionCommand'
// 批量命令
export * from './BatchCommand'
// 图层命令
export * from './ChangeLayerOrderCommand'
// 对齐分布命令
export * from './AlignElementsCommand'
// 组合命令
// 命令工具函数
export class CommandUtils {
  static async createBatchFromSelection(
    host: any,
    commandClass: any,
    ...args: any[]
  ): Promise<any> {
    const selectedIds = host.state.selectedElementIds
    const commands = selectedIds.map((id: any) => {
      const element = host.getElement(id)
      return new commandClass(element, host, ...args)
    })
    return new (await import('./BatchCommand')).BatchCommand(commands)
  }

  static isTransformCommand(command: any): boolean {
    return command.name === 'TRANSFORM_ELEMENT'
  }

  static isPropertyCommand(command: any): boolean {
    return command.name === 'UPDATE_PROPERTY'
  }
}
