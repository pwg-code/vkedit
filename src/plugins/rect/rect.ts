import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import IconRectangle from '~icons/ph/square-light'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { EditorHost } from '@/core'
import { GraphicPlugin } from '@/types/graphic-plugin'

export interface RectOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  fill?: string
  stroke?: string
  strokeWidthMM?: number
  xmm?: number
  ymm?: number
}

// 矩形元素实现
export class RectElement extends BaseGraphicElement {
  public type = 'rect'
  public fill: string = ''
  public stroke: string = 'black'
  public strokeWidthMM: number = 0.2

  constructor(host: EditorHost, options: Partial<RectOptions> = {}) {
    // 支持传入 xmm/ymm 或 x/y
    super(host, {
      xmm: options.xmm ?? options.x ?? 5,
      ymm: options.ymm ?? options.y ?? 5,
      wmm: options.wmm ?? 30,
      hmm: options.hmm ?? 30,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      resizable: options.resizable,
    })
    this.fill = options.fill ?? this.fill
    this.stroke = options.stroke ?? this.stroke
    this.strokeWidthMM = options.strokeWidthMM ?? this.strokeWidthMM
  }

  public get strokeWidth() {
    return Math.round(this.strokeWidthMM * this.host.status.dpm)
  }

  public get config() {
    return {
      ...super.config,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.fill = data.fill
    this.stroke = data.stroke
    this.strokeWidthMM = data.strokeWidthMM
  }

  serialize() {
    return {
      ...super.serialize(),
      fill: this.fill,
      stroke: this.stroke,
      strokeWidthMM: this.strokeWidthMM,
    }
  }
}

export class RectPlugin extends GraphicPlugin<RectElement> {
  public name = 'rect-plugin'
  public version = '1.0.0'
  public graphicType = 'rect'
  public graphicElement = RectElement
  public shapeComponent = Shape
  public iconComponent = IconRectangle
  public typeDisplayName = '矩形'
  public propertyPanel = PropertyPanel
}

