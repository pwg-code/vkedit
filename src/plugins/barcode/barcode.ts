import { BasePlugin } from '../../types/base-plugin'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import type { EditorHost } from '@/core'
import JsBarcode from 'jsbarcode'

export interface BarcodeOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  content?: string
  format?: string
  foreground?: string
  background?: string
  marginMM?: number
  displayValue: boolean
  fontSizeMM: number
}

export class BarcodeElement extends BaseGraphicElement {
  public type = 'barcode'
  public content: string = '123456789012'
  public format: string = 'CODE128'
  public foreground: string = '#000000'
  public background: string = '#ffffff'
  public displayValue: boolean = true
  public fontSizeMM: number = 3
  public marginMM: number = 0.2

  constructor(host: EditorHost, options: Partial<BarcodeOptions> = {}) {
    super(host, {
      xmm: options.xmm ?? 5,
      ymm: options.ymm ?? 5,
      wmm: options.wmm ?? 40,
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
    this.format = options.format ?? this.format
    this.foreground = options.foreground ?? this.foreground
    this.background = options.background ?? this.background
    this.displayValue = options.displayValue ?? this.displayValue
    this.fontSizeMM = options.fontSizeMM ?? this.fontSizeMM
    this.marginMM = options.marginMM ?? this.marginMM
  }

  public get fontSize() {
    return Math.round(this.fontSizeMM * this.host.status.dpm)
  }
  public get margin() {
    return Math.round(this.marginMM * this.host.status.dpm)
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.content = data.content
    this.format = data.format
    this.foreground = data.foreground
    this.background = data.background
    this.displayValue = data.displayValue
    this.fontSizeMM = data.fontSizeMM
    this.marginMM = data.marginMM
  }

  serialize() {
    return {
      ...super.serialize(),
      content: this.content,
      format: this.format,
      foreground: this.foreground,
      background: this.background,
      displayValue: this.displayValue,
      fontSizeMM: this.fontSizeMM,
      marginMM: this.marginMM,
    }
  }
  async renderBarcode(): Promise<HTMLCanvasElement> {
    const heightPx = Math.max(1, Math.round(this.height))
    const canvas = document.createElement('canvas')
    try {
      // width option controls bar width; keep it small to fit
      JsBarcode(canvas, this.content ?? '', {
        format: (this.format as any) ?? 'CODE128',
        lineColor: this.foreground ?? '#000',
        background: this.background ?? '#fff',
        height: heightPx,
        displayValue: this.displayValue,
        fontSize: this.fontSize,
        fontOptions: 'bold',
        margin: this.margin,
        font: 'OCR-B',
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('JsBarcode render error', e)
    }
    return canvas
  }
}

export class BarcodePlugin extends BasePlugin {
  public name = 'barcode-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return

    this.host.emit('graphic-tool:registered', {
      type: 'barcode',
      render: () => Tool,
      source: 'barcode-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('graphic:registered', {
      type: 'barcode',
      render: () => Shape,
      source: 'barcode-plugin-on-install',
      timestamp: Date.now(),
    })

    this.host.emit('property-panel:registered', {
      graphicTypes: ['barcode'],
      render: () => PropertyPanel,
      source: 'barcode-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })

    this.host.emit('element:registered', {
      type: 'barcode',
      createElement: () => new BarcodeElement(this.host),
      source: 'barcode-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}

declare module '@/types' {
  interface ElementTypeMap {
    barcode: BarcodeElement
  }
}

declare module '@/types' {
  interface PluginMap {
    'barcode-plugin': BarcodePlugin
  }
}
