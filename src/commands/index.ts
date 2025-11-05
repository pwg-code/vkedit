export * from './i-command'
export * from './base-command'
// 图形元素命令
export * from './add-element-command'
export * from './remove-element-command'
export * from './transform-element-command'
export * from './update-property-command'
// 选择命令
export * from './clear-selection-command'
// 批量命令
export * from './batch-command'
// 图层命令
export * from './change-layer-order-command'
// 对齐分布命令
export * from './align-elements-command'
// 组合命令
export * from './clear-selection-command'

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
    return new (await import('./batch-command')).BatchCommand(commands)
  }

  static isTransformCommand(command: any): boolean {
    return command.name === 'TRANSFORM_ELEMENT'
  }

  static isPropertyCommand(command: any): boolean {
    return command.name === 'UPDATE_PROPERTY'
  }
}
