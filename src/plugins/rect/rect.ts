import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import type { EditorHost } from '@/core'

export interface RectOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  xmm?: number
  ymm?: number
}

// 矩形元素实现
export class RectElement extends BaseGraphicElement {
  public type = 'rect'
  public fill: string = ''
  public stroke: string = 'black'
  public strokeWidth: number = 2

  constructor(host:EditorHost ,options: Partial<RectOptions> = {}) {
    // 支持传入 xmm/ymm 或 x/y
    super(host,{
      xmm: options.xmm ?? options.x ?? 5,
      ymm: options.ymm ?? options.y ?? 5,
      wmm: options.wmm,
      hmm: options.hmm,
      rotation: options.rotation,
      scaleX: options.scaleX,
      scaleY: options.scaleY,
      visible: options.visible,
      locked: options.locked,
      draggable: options.draggable,
      transferable: options.transferable,
    })
    this.fill = options.fill ?? this.fill
    this.stroke = options.stroke ?? this.stroke
    this.strokeWidth = options.strokeWidth ?? this.strokeWidth
  }

  public get config() {
    return {
      ...super.config,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  clone(): IGraphicElement {
    const newElement = new RectElement(this.host)
    newElement.deserialize(this)
    return newElement
  }

  serialize() {
    return {
      ...super.serialize(),
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }
}

export class RectPlugin extends BasePlugin {
  public name = 'rect-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 图形工具
    this.host.emit('graphic-tool:registered', {
      type: 'rect',
      render: () => Tool,
      source: 'rect-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册图形
    this.host.emit('graphic:registered', {
      type: 'rect',
      render: () => Shape,
      source: 'rect-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册属性面板
    this.host.emit('property-panel:registered', {
      graphicTypes: ['rect'],
      render: () => PropertyPanel,
      source: 'rect-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })
    // 注册元素构造器
    this.host.emit('element:registered', {
      type: 'rect',
      createElement: () => new RectElement(this.host, {xmm:10, ymm:10 ,wmm:50, hmm:30 }),
      source: 'rect-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}

// 将 RectElement 注册到可扩展的 ElementTypeMap（仅类型信息）
declare module '@/types' {
  interface ElementTypeMap {
    rect: RectElement
  }
}

// 将 RectPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'rect-plugin': RectPlugin
  }
}
