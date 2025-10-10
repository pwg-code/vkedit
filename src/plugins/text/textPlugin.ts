import { BasePlugin } from '../../styles/BasePlugin'
import type { IGraphicType, IGraphicElement, IPropertyPanel } from '../../types'
import TextGraphic from './TextGraphic.vue'
import TextPropertyPanel from './TextPropertyPanel.vue'

// 矩形元素实现
export class TextElement implements IGraphicElement {
  [key: string]: any
  public readonly type = 'text'
  constructor(
    public id: string,
    public x: number,
    public y: number,
    public text: string = '新建文本',
    public fontSize: number = 20,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1,
    public visible: boolean = true,
    public locked: boolean = false,
    public draggable: boolean = true,
  ) {}

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: 10 * this.scaleX,
      height: 10 * this.scaleY,
    }
  }

  clone(): IGraphicElement {
    return new TextElement(
      `text-${Date.now()}`,
      this.x,
      this.y,
      this.text,
      this.fontSize,
      this.rotation,
      this.scaleX,
      this.scaleY,
      this.visible,
      this.locked,
    )
  }

  serialize() {
    return {
      type: this.type,
      id: this.id,
      x: this.x,
      y: this.y,
      text: this.text,
      fontSize: this.fontSize,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      locked: this.locked,
    }
  }

  deserialize(data: any): void {
    Object.assign(this, data)
  }
}

export class TextPlugin extends BasePlugin {
  public name = 'text-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册矩形图形类型
    this.host.emit('graphic-type:registered', this.getGraphicType())
    // 注册属性面板
    this.host.emit('property-panel:registered', this.getPropertyPanel())
  }
  private getPropertyPanel(): IPropertyPanel {
    return {
      type: 'text',
      title: '文本属性',
      getComponent: () => TextPropertyPanel,
    }
  }

  private getGraphicType(): IGraphicType {
    return {
      type: 'text',
      name: '文本',
      icon: '',
      defaultProps: {
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 2,
        cornerRadius: 0,
      },
      getComponent() {
        return TextGraphic
      },
      createElement: (x: number, y: number) => {
        return new TextElement(`text-${Date.now()}`, x, y)
      },
      getTransformAttr(event, element) {
        return {
          oldAttrs: {
            ...element,
          },
          newAttrs: {
            ...event.target.attrs,
          },
        }
      },
    }
  }
}
