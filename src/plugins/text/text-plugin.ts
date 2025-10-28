import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import { EditorEvents } from '@/types/event-types'

// 矩形元素实现
export class TextElement extends BaseGraphicElement {
  [key: string]: any
  public readonly type = 'text'
  constructor(
    public x: number = 50,
    public y: number = 50,
    public text: string = '新建文本',
    public fontSize: number = 20,
  ) {
    super(x, y, 80, 20)
  }

  serialize() {
    return {
      ...super.serialize(),
      text: this.text,
      fontSize: this.fontSize,
    }
  }
}

export class TextGraphicType extends BaseGraphicType {
  type: string = 'text'
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
    return new TextElement()
  }
}

export class TextPlugin extends BasePlugin {
  public name = 'text-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册矩形图形类型
    this.host.emit(EditorEvents.GRAPHIC_TYPE_REGISTERED, new TextGraphicType())
  }
}
