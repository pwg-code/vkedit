import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import { GraphicPlugin } from '@/types/graphic-plugin'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import IconTextFields from '~icons/ph/text-aa-light'
import TextContextMenu from './TextContextMenu.vue'
import type { EditorHost } from '@/core'

export interface TextOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  text?: string
  fontSize?: number
  align?: 'left' | 'center' | 'right' | 'justify'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  fontStyle?: 'normal' | 'italic' | 'bold' | '500' | 'italic bold'
  fill?: string
  xmm?: number
  ymm?: number
}

export class TextElement extends BaseGraphicElement {
  public type = 'text'
  public text: string = '新建文本'
  public fontSize: number = 20
  public align: 'left' | 'center' | 'right' | 'justify' = 'left'
  public verticalAlign: 'top' | 'middle' | 'bottom' = 'bottom'
  public fontStyle: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' = 'normal'
  public fill: string = '#000000'

  constructor(host:EditorHost,options: Partial<TextOptions> = {}) {
    super(host,{
      xmm: options.xmm ?? 5,
      ymm: options.ymm ?? 5,
      wmm: options.wmm ?? 20,
      hmm: options.hmm ?? 3,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      resizable: options.resizable,
    })
    this.text = options.text ?? this.text
    this.fontSize = options.fontSize ?? this.fontSize
    this.align = options.align ?? this.align
    this.verticalAlign = options.verticalAlign ?? this.verticalAlign
    this.fontStyle = options.fontStyle ?? this.fontStyle
    this.fill = options.fill ?? this.fill
  }

  public get config() {
    return {
      ...super.config,
      text: this.text,
      fontSize: this.fontSize,
      align: this.align,
      verticalAlign: this.verticalAlign,
      fontStyle: this.fontStyle,
      fill: this.fill,
    }
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.text = data.text
    this.fontSize = data.fontSize
    this.align = data.align
    this.verticalAlign = data.verticalAlign
    this.fontStyle = data.fontStyle
    this.fill = data.fill
  }

  serialize() {
    return {
      ...super.serialize(),
      text: this.text,
      fontSize: this.fontSize,
      align: this.align,
      verticalAlign: this.verticalAlign,
      fontStyle: this.fontStyle,
      fill: this.fill,
    }
  }
}

export class TextPlugin extends GraphicPlugin<TextElement> {
  public name = 'text-plugin'
  public version = '1.0.0'
  public graphicType = 'text'
  public graphicElement = TextElement
  public shapeComponent = Shape
  public iconComponent = IconTextFields
  public typeDisplayName = '文本'
  public propertyPanel = PropertyPanel

  protected onInstall(): void {
    this.host.emit('context-menu:registered', {
      graphicTypes: ['text'],
      render: () => TextContextMenu,
      isPublic: false,
      isCanvas: false,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
  }

  protected onUninstall(): void {
    this.host?.emit('context-menu:unregistered', {
      graphicTypes: ['text'],
      render: () => TextContextMenu,
      isPublic: false,
      isCanvas: false,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}
