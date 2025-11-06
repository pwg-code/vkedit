import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import { EditorEvents } from '@/types/event-types'
import type { Component } from 'vue'

// 矩形元素实现
export class RectElement extends BaseGraphicElement {
  [key: string]: any
  public type = 'rect'
  constructor(
    public x: number = 50,
    public y: number = 50,
    public fill: string = '',
    public stroke: string = '#000000',
    public strokeWidth: number = 2,
    public cornerRadius: number = 0,
  ) {
    super(x, y)
  }

  clone(): IGraphicElement {
    const newElement = new RectElement()
    newElement.deserialize(this)
    return newElement
  }

  serialize() {
    return {
      ...super.serialize(),
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      cornerRadius: this.cornerRadius,
    }
  }
}

export class RectGraphicType extends BaseGraphicType {
  type: string = 'rect'
  render(): Component {
    return Shape
  }
  renderPropertyPanel(): Component {
    return PropertyPanel
  }
  renderTool(): Component {
    return Tool
  }
  createElement(x: number, y: number): IGraphicElement {
    return new RectElement()
  }
}

export class RectPlugin extends BasePlugin {
  public name = 'rect-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册矩形图形类型
    this.host.emit(EditorEvents.GRAPHIC_TYPE_REGISTERED, new RectGraphicType())
  }
}
