import { GraphicPlugin } from '@/types/graphic-plugin'
import type { PropertyPanelRegistration } from '@/types/graphic-plugin'
import { BaseGraphicElement, CORNER_ANCHORS, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import IconQrCode2 from '~icons/material-symbols-light/qr-code-2'
import type { EditorHost } from '@/core'
import QRCode from 'qrcode'

export interface QrcodeOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  content?: string
  foreground?: string
  background?: string
  marginMM?: number
}

export class QrcodeElement extends BaseGraphicElement {
  public type = 'qr'
  public content: string = 'https://example.com'
  public foreground: string = '#000000'
  public background: string = '#ffffff'
  public marginMM: number = 0.2
  // public image = useImage('')[0]

  constructor(host: EditorHost, options: Partial<QrcodeOptions> = {}) {
    super(host, {
      xmm: options.xmm ?? 5,
      ymm: options.ymm ?? 5,
      wmm: options.wmm ?? 20,
      hmm: options.hmm ?? 20,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      resizable: options.resizable,
    })
    this.content = options.content ?? this.content
    this.foreground = options.foreground ?? this.foreground
    this.background = options.background ?? this.background
    this.marginMM = options.marginMM ?? this.marginMM
    this.resizeAnchors = CORNER_ANCHORS
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.content = data.content
    this.foreground = data.foreground
    this.background = data.background
    this.marginMM = data.marginMM
  }

  serialize() {
    return {
      ...super.serialize(),
      content: this.content,
      foreground: this.foreground,
      background: this.background,
      marginMM: this.marginMM,
    }
  }

  override get config(): {
    [key: string]: any
    id: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
    visible: boolean
    draggable: boolean
  } {
    const baseConfig = super.config
    baseConfig.height = baseConfig.width
    return baseConfig
  }

  get margin() {
    return Math.round(this.marginMM * this.host.status.dpm)
  }

  async renderQrcode(): Promise<HTMLCanvasElement> {
    const sizePx = Math.max(1, Math.round(this.width))
    const opts = {
      color: {
        dark: this.foreground ?? '#000',
        light: this.background ?? '#fff',
      },
      width: sizePx,
      margin: this.margin,
    }
    return await QRCode.toCanvas(this.content ?? '', opts)
  }

  override getBoundingBox(): { x: number; y: number; width: number; height: number } {
    // 二位始终为正方形
    return { ...super.getBoundingBox(), height: this.width }
  }
}

export class QrcodePlugin extends GraphicPlugin<QrcodeElement> {
  public name = 'qr-plugin'
  public version = '1.0.0'
  public graphicType = 'qr'
  public graphicElement = QrcodeElement
  public shapeComponent = Shape
  public iconComponent = IconQrCode2
  public typeDisplayName = '二维码'
  public propertyPanels: PropertyPanelRegistration[] = [
    { graphicTypes: ['qr'], render: () => PropertyPanel, isCanvas: false, isPublic: false },
  ]
  protected onInstall(): void { this.activate() }
  protected onUninstall(): void { this.deactivate() }
}
