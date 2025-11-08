import { BaseCommand } from './base-command'
import type { IGraphicElement } from '../types'
import type { EditorHost} from '@/core'
import type { ICommand } from './i-command'

export class TransformElementCommand extends BaseCommand {
  public name = 'TRANSFORM_ELEMENT'
  private element: IGraphicElement
  private host: EditorHost
  private oldState: any
  private newState: any
  private transformType: "move" | "rotate" | "scale" | "skew" | "resize" | "transform"
  constructor(element: IGraphicElement, host: EditorHost, oldState: any, newState: any) {
    super('变换元素')
    this.element = element
    this.host = host
    this.oldState = { ...oldState }
    this.newState = { ...newState }
    this.transformType = this.detectTransformType(oldState, newState)
  }

  execute(): void {
    this.applyState(this.newState)
    this.host.emit('element:transformed', {
      element: this.element,
      elementId: this.element.id,
      oldState: this.oldState,
      newState: this.newState,
      transformType: this.transformType,
      timestamp: this.timestamp,
      source: 'transform-element-command-execute',
    })

    this.host.emit('element:updated', {
      element: this.element,
      elementId: this.element.id,
      updatedProperties: Object.keys(this.newState),
      timestamp: this.timestamp,
      source: 'transform-element-command-execute',
    })
  }

  undo(): void {
    this.applyState(this.oldState)
    this.host.emit('element:transformed', {
      element: this.element,
      elementId: this.element.id,
      oldState: this.newState,
      newState: this.oldState,
      transformType: this.transformType,
      timestamp: this.timestamp,
      source: 'transform-element-command-undo',
    })

    this.host.emit('element:updated', {
      element: this.element,
      elementId: this.element.id,
      updatedProperties: Object.keys(this.oldState),
      timestamp: this.timestamp,
      source: 'transform-element-command-undo',
    })
  }

  private applyState(state: any): void {
    // 更新属性
    for (const key in state) {
      if ((this.element as any)[key] !== undefined) {
        ;(this.element as any)[key] = state[key]
      }
    }
  }

  private detectTransformType(oldState: any, newState: any): 'move' | 'rotate' | 'scale' | 'skew' | 'resize' | 'transform' {
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
    return new TransformElementCommand(this.element, this.host, this.oldState, command.newState)
  }
}
