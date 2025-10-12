import { BaseCommand } from './BaseCommand'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { ICommand } from './ICommand'
import type { ElementsPlugin } from '@/plugins'

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
