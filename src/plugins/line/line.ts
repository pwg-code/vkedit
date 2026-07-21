import { GraphicPlugin, type PropertyPanelRegistration } from '@/types/graphic-plugin'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { EditorHost } from '@/core'

export interface LineOptions extends BaseGraphicElementOptions {
  stroke?: string
  xmm?: number
  ymm?: number
}

// 矩形元素实现
export class LineElement extends BaseGraphicElement {
  public type = 'line'
  public stroke: string = 'black'
  // 把width 当做线长 height当做线宽

  constructor(host: EditorHost, options: Partial<LineOptions> = {}) {
    // 支持传入 xmm/ymm 或 x/y
    super(host, {
      xmm: options.xmm ?? 5,
      ymm: options.ymm ?? 5,
      wmm: options.wmm ?? 10,
      hmm: options.hmm ?? 0.2,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      resizable: options.resizable,
    })
    this.stroke = options.stroke ?? this.stroke
  }

  public get config() {
    return {
      ...super.config,
      points: [0, 0, this.width, 0],
      stroke: this.stroke,
      strokeWidth: this.height,
      hitStrokeWidth: this.height + 20,
    }
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.stroke = data.stroke
  }

  serialize() {
    return {
      ...super.serialize(),
      stroke: this.stroke,
    }
  }
}

export class LinePlugin extends GraphicPlugin<LineElement> {
  public name = 'line-plugin'
  public version = '1.0.0'
  public graphicType = 'line'
  public graphicElement = LineElement
  public shapeComponent = Shape
  public toolComponent = Tool
  public propertyPanels: PropertyPanelRegistration[] = [
    { graphicTypes: ['line'], render: () => PropertyPanel, isCanvas: false, isPublic: false },
  ]
  protected onInstall(): void { this.activate() }
  protected onUninstall(): void { this.deactivate() }
}
