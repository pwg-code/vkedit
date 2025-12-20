import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement } from '../../types'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import type { EditorHost } from '@/core'
// import { useImage } from 'vue-konva';
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
      transferable: options.transferable,
    })
    this.content = options.content ?? this.content
    this.foreground = options.foreground ?? this.foreground
    this.background = options.background ?? this.background
    this.marginMM = options.marginMM ?? this.marginMM
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
}

export class QrcodePlugin extends BasePlugin {
  public name = 'qr-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return

    this.host.emit('graphic-tool:registered', {
      type: 'qr',
      render: () => Tool,
      source: 'qr-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('graphic:registered', {
      type: 'qr',
      render: () => Shape,
      source: 'qr-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('property-panel:registered', {
      graphicTypes: ['qr'],
      render: () => PropertyPanel,
      source: 'qr-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })

    this.host.emit('element:registered', {
      type: 'qr',
      createElement: () => new QrcodeElement(this.host),
      source: 'qr-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}

declare module '@/types' {
  interface ElementTypeMap {
    qr: QrcodeElement
  }
}

declare module '@/types' {
  interface PluginMap {
    'qr-plugin': QrcodePlugin
  }
}
