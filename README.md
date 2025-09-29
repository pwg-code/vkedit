Commands 文件夹完整代码

1. 基础命令接口

ICommand.ts

```typescript
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
```

2. 基础命令类

BaseCommand.ts

```typescript
import { ICommand } from './ICommand'

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
```

3. 图形元素相关命令

AddElementCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class AddElementCommand extends BaseCommand {
  public name = 'ADD_ELEMENT'

  constructor(
    private element: IGraphicElement,

    private host: IEditorHost,
  ) {
    super(`添加 ${element.type} 元素`)
  }

  execute(): void {
    this.host.addElement(this.element)

    this.host.emit(EditorEvents.ELEMENT_ADDED, {
      element: this.element,

      elementId: this.element.id,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.host.removeElement(this.element.id)

    this.host.emit(EditorEvents.ELEMENT_REMOVED, {
      element: this.element,

      elementId: this.element.id,

      timestamp: this.timestamp,
    })
  }

  canMergeWith(command: ICommand): boolean {
    return command instanceof AddElementCommand && Date.now() - command.timestamp < 1000
  }
}
```

RemoveElementCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class RemoveElementCommand extends BaseCommand {
  public name = 'REMOVE_ELEMENT'

  private elementData: any

  constructor(
    private elementId: string,

    private host: IEditorHost,
  ) {
    super('删除元素')

    // 保存元素的序列化数据，用于撤销时恢复

    const element = this.host.getElement(elementId)

    if (element) {
      this.elementData = element.serialize()
    }
  }

  execute(): void {
    const element = this.host.getElement(this.elementId)

    if (element) {
      this.host.removeElement(this.elementId)

      this.host.emit(EditorEvents.ELEMENT_REMOVED, {
        element,

        elementId: this.elementId,

        timestamp: this.timestamp,
      })
    }
  }

  undo(): void {
    if (this.elementData) {
      const element = this.deserializeElement(this.elementData)

      if (element) {
        this.host.addElement(element)

        this.host.emit(EditorEvents.ELEMENT_ADDED, {
          element,

          elementId: element.id,

          timestamp: this.timestamp,
        })
      }
    }
  }

  private deserializeElement(data: any): IGraphicElement | null {
    try {
      // 这里需要根据元素类型创建对应的元素实例

      // 简化实现，实际应该根据类型映射到具体的元素类

      const elementClass = this.getElementClass(data.type)

      if (!elementClass) return null

      const element = new elementClass(data.id, 0, 0)

      element.deserialize(data)

      return element
    } catch (error) {
      console.error('Failed to deserialize element:', error)

      return null
    }
  }

  private getElementClass(type: string): any {
    // 这里应该从插件系统获取对应的元素类

    const classMap: { [key: string]: any } = {
      rect: class MockRectElement {
        constructor(
          public id: string,
          public x: number,
          public y: number,
        ) {}

        serialize() {
          return {}
        }

        deserialize(data: any) {
          Object.assign(this, data)
        }
      },

      circle: class MockCircleElement {
        constructor(
          public id: string,
          public x: number,
          public y: number,
        ) {}

        serialize() {
          return {}
        }

        deserialize(data: any) {
          Object.assign(this, data)
        }
      },
    }

    return classMap[type]
  }
}
```

TransformElementCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class TransformElementCommand extends BaseCommand {
  public name = 'TRANSFORM_ELEMENT'

  private element: IGraphicElement

  private host: IEditorHost

  private oldState: any

  private newState: any

  private transformType: string

  constructor(
    element: IGraphicElement,

    host: IEditorHost,

    oldState: any,

    newState: any,
  ) {
    super('变换元素')

    this.element = element

    this.host = host

    this.oldState = { ...oldState }

    this.newState = { ...newState }

    this.transformType = this.detectTransformType(oldState, newState)
  }

  execute(): void {
    this.applyState(this.newState)

    this.host.emit(EditorEvents.ELEMENT_TRANSFORMED, {
      element: this.element,

      elementId: this.element.id,

      oldState: this.oldState,

      newState: this.newState,

      transformType: this.transformType,

      timestamp: this.timestamp,
    })

    this.host.emit(EditorEvents.ELEMENT_UPDATED, {
      element: this.element,

      elementId: this.element.id,

      updatedProperties: Object.keys(this.newState),

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.applyState(this.oldState)

    this.host.emit(EditorEvents.ELEMENT_TRANSFORMED, {
      element: this.element,

      elementId: this.element.id,

      oldState: this.newState,

      newState: this.oldState,

      transformType: this.transformType,

      timestamp: this.timestamp,
    })

    this.host.emit(EditorEvents.ELEMENT_UPDATED, {
      element: this.element,

      elementId: this.element.id,

      updatedProperties: Object.keys(this.oldState),

      timestamp: this.timestamp,
    })
  }

  private applyState(state: any): void {
    // 更新基础变换属性

    const transformProps = ['x', 'y', 'rotation', 'scaleX', 'scaleY']

    transformProps.forEach((prop) => {
      if (state[prop] !== undefined) {
        ;(this.element as any)[prop] = state[prop]
      }
    })

    // 更新图形特定属性

    const graphicProps = ['width', 'height', 'radius', 'points']

    graphicProps.forEach((prop) => {
      if (state[prop] !== undefined && (this.element as any)[prop] !== undefined) {
        ;(this.element as any)[prop] = state[prop]
      }
    })
  }

  private detectTransformType(oldState: any, newState: any): string {
    if (newState.rotation !== undefined && newState.rotation !== oldState.rotation) {
      return 'rotate'
    }

    if (newState.scaleX !== undefined || newState.scaleY !== undefined) {
      return 'scale'
    }

    if (newState.width !== undefined || newState.height !== undefined) {
      return 'resize'
    }

    if (newState.x !== undefined || newState.y !== undefined) {
      return 'move'
    }

    return 'transform'
  }

  canMergeWith(command: ICommand): boolean {
    if (!(command instanceof TransformElementCommand)) return false

    return (
      command.element.id === this.element.id &&
      command.transformType === this.transformType &&
      Date.now() - command.timestamp < 500
    )
  }

  mergeWith(command: TransformElementCommand): ICommand {
    return new TransformElementCommand(
      this.element,

      this.host,

      this.oldState,

      command.newState,
    )
  }
}
```

UpdatePropertyCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class UpdatePropertyCommand extends BaseCommand {
  public name = 'UPDATE_PROPERTY'

  private element: IGraphicElement

  private host: IEditorHost

  private propertyPath: string

  private oldValue: any

  private newValue: any

  constructor(
    element: IGraphicElement,

    host: IEditorHost,

    propertyPath: string,

    oldValue: any,

    newValue: any,
  ) {
    super(`更新属性 ${propertyPath}`)

    this.element = element

    this.host = host

    this.propertyPath = propertyPath

    this.oldValue = this.deepClone(oldValue)

    this.newValue = this.deepClone(newValue)
  }

  execute(): void {
    this.setProperty(this.propertyPath, this.newValue)

    this.emitPropertyChange()
  }

  undo(): void {
    this.setProperty(this.propertyPath, this.oldValue)

    this.emitPropertyChange()
  }

  private setProperty(path: string, value: any): void {
    const parts = path.split('.')

    let current: any = this.element

    // 遍历到倒数第二个属性

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        current[parts[i]] = {}
      }

      current = current[parts[i]]
    }

    // 设置最后一个属性

    current[parts[parts.length - 1]] = value
  }

  private getProperty(path: string): any {
    const parts = path.split('.')

    let current: any = this.element

    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined
      }

      current = current[part]
    }

    return current
  }

  private emitPropertyChange(): void {
    this.host.emit(EditorEvents.PROPERTY_VALUE_CHANGE, {
      element: this.element,

      elementId: this.element.id,

      propertyPath: this.propertyPath,

      oldValue: this.oldValue,

      newValue: this.newValue,

      timestamp: this.timestamp,
    })

    this.host.emit(EditorEvents.ELEMENT_UPDATED, {
      element: this.element,

      elementId: this.element.id,

      updatedProperties: [this.propertyPath],

      timestamp: this.timestamp,
    })
  }

  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj

    if (obj instanceof Date) return new Date(obj)

    if (obj instanceof Array) return obj.map((item) => this.deepClone(item))

    const cloned: any = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }

    return cloned
  }

  canMergeWith(command: ICommand): boolean {
    if (!(command instanceof UpdatePropertyCommand)) return false

    return (
      command.element.id === this.element.id &&
      command.propertyPath === this.propertyPath &&
      Date.now() - command.timestamp < 1000
    )
  }

  mergeWith(command: UpdatePropertyCommand): ICommand {
    return new UpdatePropertyCommand(
      this.element,

      this.host,

      this.propertyPath,

      this.oldValue,

      command.newValue,
    )
  }
}
```

4. 批量操作命令

BatchCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { ICommand } from './ICommand'

import { EditorEvents } from '../EventTypes'

export class BatchCommand extends BaseCommand {
  public name = 'BATCH_COMMAND'

  private commands: ICommand[] = []

  constructor(
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
```

5. 选择相关命令

SelectElementCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost } from '../types'

import { EditorEvents } from '../EventTypes'

export class SelectElementCommand extends BaseCommand {
  public name = 'SELECT_ELEMENT'

  constructor(
    private host: IEditorHost,

    private elementIds: string[],

    private previousElementIds: string[],
  ) {
    super('选择元素')
  }

  execute(): void {
    this.host.setState({
      selectedElementIds: this.elementIds,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.elementIds,

      previousSelectedIds: this.previousElementIds,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.host.setState({
      selectedElementIds: this.previousElementIds,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.previousElementIds,

      previousSelectedIds: this.elementIds,

      timestamp: this.timestamp,
    })
  }

  static createSelectionChange(
    host: IEditorHost,

    newSelection: string[],

    oldSelection: string[],
  ): SelectElementCommand {
    return new SelectElementCommand(host, newSelection, oldSelection)
  }
}
```

ClearSelectionCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost } from '../types'

import { EditorEvents } from '../EventTypes'

export class ClearSelectionCommand extends BaseCommand {
  public name = 'CLEAR_SELECTION'

  private previousSelection: string[] = []

  constructor(private host: IEditorHost) {
    super('清空选择')

    this.previousSelection = [...host.state.selectedElementIds]
  }

  execute(): void {
    this.host.setState({
      selectedElementIds: [],
    })

    this.host.emit(EditorEvents.SELECTION_CLEARED, {
      previousSelectedIds: this.previousSelection,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.host.setState({
      selectedElementIds: this.previousSelection,
    })

    this.host.emit(EditorEvents.SELECTION_CHANGED, {
      selectedIds: this.previousSelection,

      previousSelectedIds: [],

      timestamp: this.timestamp,
    })
  }
}
```

6. 图层操作命令

ChangeLayerOrderCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class ChangeLayerOrderCommand extends BaseCommand {
  public name = 'CHANGE_LAYER_ORDER'

  private previousOrder: Map<string, number> = new Map()

  constructor(
    private host: IEditorHost,

    private elementId: string,

    private direction: 'up' | 'down' | 'top' | 'bottom',
  ) {
    super(`调整图层顺序: ${direction}`)
  }

  execute(): void {
    // 保存当前顺序

    this.saveCurrentOrder()

    // 执行图层顺序调整

    this.changeLayerOrder()

    this.host.emit(EditorEvents.ELEMENTS_LAYER, {
      elementId: this.elementId,

      direction: this.direction,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    // 恢复之前的顺序

    this.restorePreviousOrder()

    this.host.emit(EditorEvents.ELEMENTS_LAYER, {
      elementId: this.elementId,

      direction: this.getReverseDirection(),

      timestamp: this.timestamp,
    })
  }

  private saveCurrentOrder(): void {
    // 这里需要实现保存当前图层顺序的逻辑
    // 简化实现
  }

  private changeLayerOrder(): void {
    // 这里需要实现调整图层顺序的逻辑
    // 简化实现
  }

  private restorePreviousOrder(): void {
    // 这里需要实现恢复图层顺序的逻辑
    // 简化实现
  }

  private getReverseDirection(): string {
    const reverseMap: { [key: string]: string } = {
      up: 'down',

      down: 'up',

      top: 'bottom',

      bottom: 'top',
    }

    return reverseMap[this.direction] || this.direction
  }
}
```

7. 对齐分布命令

AlignElementsCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class AlignElementsCommand extends BaseCommand {
  public name = 'ALIGN_ELEMENTS'

  private previousPositions: Map<string, { x: number; y: number }> = new Map()

  constructor(
    private host: IEditorHost,

    private alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY',

    private elementIds: string[],
  ) {
    super(`对齐元素: ${alignment}`)

    // 保存原始位置

    this.elementIds.forEach((id) => {
      const element = this.host.getElement(id)

      if (element) {
        this.previousPositions.set(id, { x: element.x, y: element.y })
      }
    })
  }

  execute(): void {
    this.alignElements()

    this.host.emit(EditorEvents.ELEMENTS_ALIGN, {
      alignment: this.alignment,

      elementIds: this.elementIds,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    this.restorePreviousPositions()

    this.host.emit(EditorEvents.ELEMENTS_ALIGN, {
      alignment: 'undo',

      elementIds: this.elementIds,

      timestamp: this.timestamp,
    })
  }

  private alignElements(): void {
    const elements = this.elementIds

      .map((id) => this.host.getElement(id))

      .filter(Boolean) as IGraphicElement[]

    if (elements.length === 0) return

    switch (this.alignment) {
      case 'left':
        const minX = Math.min(...elements.map((el) => el.x))

        elements.forEach((el) => (el.x = minX))

        break

      case 'right':
        const maxX = Math.max(...elements.map((el) => el.x + (el as any).width))

        elements.forEach((el) => (el.x = maxX - (el as any).width))

        break

      case 'top':
        const minY = Math.min(...elements.map((el) => el.y))

        elements.forEach((el) => (el.y = minY))

        break

      case 'bottom':
        const maxY = Math.max(...elements.map((el) => el.y + (el as any).height))

        elements.forEach((el) => (el.y = maxY - (el as any).height))

        break

      case 'centerX':
        const centerX =
          elements.reduce((sum, el) => sum + el.x + (el as any).width / 2, 0) / elements.length

        elements.forEach((el) => (el.x = centerX - (el as any).width / 2))

        break

      case 'centerY':
        const centerY =
          elements.reduce((sum, el) => sum + el.y + (el as any).height / 2, 0) / elements.length

        elements.forEach((el) => (el.y = centerY - (el as any).height / 2))

        break
    }
  }

  private restorePreviousPositions(): void {
    this.elementIds.forEach((id) => {
      const element = this.host.getElement(id)

      const previousPos = this.previousPositions.get(id)

      if (element && previousPos) {
        element.x = previousPos.x

        element.y = previousPos.y
      }
    })
  }
}
```

8. 组合命令

GroupElementsCommand.ts

```typescript
import { BaseCommand } from './BaseCommand'

import { IEditorHost, IGraphicElement } from '../types'

import { EditorEvents } from '../EventTypes'

export class GroupElementsCommand extends BaseCommand {
  public name = 'GROUP_ELEMENTS'

  private groupElement: IGraphicElement | null = null

  private originalElements: IGraphicElement[] = []

  constructor(
    private host: IEditorHost,

    private elementIds: string[],
  ) {
    super('组合元素')

    this.originalElements = elementIds

      .map((id) => host.getElement(id))

      .filter(Boolean) as IGraphicElement[]
  }

  execute(): void {
    if (this.originalElements.length === 0) return

    // 创建组合元素

    this.groupElement = this.createGroupElement()

    // 移除原始元素

    this.originalElements.forEach((element) => {
      this.host.removeElement(element.id)
    })

    // 添加组合元素

    this.host.addElement(this.groupElement)

    this.host.emit(EditorEvents.ELEMENTS_GROUP, {
      elementIds: this.elementIds,

      groupId: this.groupElement.id,

      timestamp: this.timestamp,
    })
  }

  undo(): void {
    if (!this.groupElement) return

    // 移除组合元素

    this.host.removeElement(this.groupElement.id)

    // 恢复原始元素

    this.originalElements.forEach((element) => {
      this.host.addElement(element)
    })

    this.host.emit(EditorEvents.ELEMENTS_UNGROUP, {
      elementIds: this.elementIds,

      groupId: this.groupElement.id,

      timestamp: this.timestamp,
    })
  }

  private createGroupElement(): IGraphicElement {
    // 这里需要实现创建组合元素的逻辑

    // 简化实现，返回一个模拟的组合元素

    return {
      id: `group-${Date.now()}`,

      type: 'group',

      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,

      visible: true,
      locked: false,

      getComponent: () => ({ component: null }),

      getBoundingBox: () => ({ x: 0, y: 0, width: 0, height: 0 }),

      clone: () => this.createGroupElement(),

      serialize: () => ({}),

      deserialize: () => {},
    } as IGraphicElement
  }
}
```

9. 命令导出文件

index.ts

```typescript
export * from './ICommand'

export * from './BaseCommand'

// 图形元素命令

export * from './AddElementCommand'

export * from './RemoveElementCommand'

export * from './TransformElementCommand'

export * from './UpdatePropertyCommand'

// 选择命令

export * from './SelectElementCommand'

export * from './ClearSelectionCommand'

// 批量命令

export * from './BatchCommand'

// 图层命令

export * from './ChangeLayerOrderCommand'

// 对齐分布命令

export * from './AlignElementsCommand'

// 组合命令

export * from './GroupElementsCommand'

// 命令工具函数

export class CommandUtils {
  static createBatchFromSelection(
    host: any,

    commandClass: any,

    ...args: any[]
  ): any {
    const selectedIds = host.state.selectedElementIds

    const commands = selectedIds.map((id) => {
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
```

1. 基础架构：统一的命令接口和基类

2. 图形操作：添加、删除、变换、属性更新

3. 选择管理：选择、清空选择

4. 批量操作：支持多个命令批量执行

5. 图层控制：图层顺序调整

6. 对齐分布：各种对齐和分布操作

7. 组合功能：元素组合和解组

8. 工具函数：命令创建和类型检查工具
