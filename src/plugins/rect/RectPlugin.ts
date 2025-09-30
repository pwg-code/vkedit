import { BasePlugin } from '../../styles/BasePlugin'
import type { IEditorHost, IGraphicType, IGraphicElement, Point2D } from '../../types'
import RectGraphic from './RectGraphic.vue'
import RectPropertyPanel from './RectPropertyPanel.vue'

// 矩形元素实现
export class RectElement implements IGraphicElement {
  public readonly type = 'rect'
  constructor(
    public id: string,
    public x: number,
    public y: number,
    public width: number = 200,
    public height: number = 100,
    public fill: string = '',
    public stroke: string = '#2980b9',
    public strokeWidth: number = 2,
    public cornerRadius: number = 0,
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
      width: this.width * this.scaleX,
      height: this.height * this.scaleY,
    }
  }

  clone(): IGraphicElement {
    return new RectElement(
      `rect-${Date.now()}`,
      this.x,
      this.y,
      this.width,
      this.height,
      this.fill,
      this.stroke,
      this.strokeWidth,
      this.cornerRadius,
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
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      cornerRadius: this.cornerRadius,
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

export class RectPlugin extends BasePlugin {
  public name = 'rect-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册矩形图形类型
    this.host.emit('graphic-type:registered', this.getGraphicType())
    // 注册工具
    this.host.emit('tool:registered', {
      id: 'rect',
      name: 'rectangle',
      icon: '⬜',
      title: '矩形工具',
      description: '绘制矩形和正方形',
    })

    // 注册属性面板
    this.host.emit('property-panel:registered', {
      for: 'rect',
      component: RectPropertyPanel,
      title: '矩形属性',
    })
  }

  private getGraphicType(): IGraphicType {
    return {
      type: 'rect',
      name: '矩形',
      icon: '⬜',
      defaultProps: {
        width: 100,
        height: 60,
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 2,
        cornerRadius: 0,
      },
      getComponent() {
        return RectGraphic
      },
      createElement: (x: number, y: number) => {
        return new RectElement(`rect-${Date.now()}`, x, y, 100, 60)
      },
    }
  }

  getTools() {
    return [
      {
        id: 'rect',
        name: 'rectangle',
        icon: '⬜',
        title: '矩形工具',
        description: '绘制矩形和正方形',
        category: 'drawing',
      },
    ]
  }
}
