import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement } from '../../types'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import type { EditorHost } from '@/core'

export interface BarcodeOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  content?: string
  format?: string
  foreground?: string
  background?: string
}

export class BarcodeElement extends BaseGraphicElement {
  public type = 'barcode'
  public content: string = '123456789012'
  public format: string = 'CODE128'
  public foreground: string = '#000000'
  public background: string = '#ffffff'

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
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.content = data.content
    this.format = data.format
    this.foreground = data.foreground
    this.background = data.background
  }

  serialize() {
    return {
      ...super.serialize(),
      content: this.content,
      format: this.format,
      foreground: this.foreground,
      background: this.background,
    }
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
