import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { Component } from 'vue'
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
      transferable: options.transferable,
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

export class LinePlugin extends BasePlugin {
  public name = 'line-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 图形工具
    this.host.emit('graphic-tool:registered', {
      type: 'line',
      render: () => Tool,
      source: 'line-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册图形
    this.host.emit('graphic:registered', {
      type: 'line',
      render: () => Shape,
      source: 'line-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册属性面板
    this.host.emit('property-panel:registered', {
      graphicTypes: ['line'],
      render: () => PropertyPanel,
      source: 'line-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })
    // 注册元素构造器
    this.host.emit('element:registered', {
      type: 'line',
      createElement: () => new LineElement(this.host, { xmm: 10, ymm: 10 }),
      source: 'line-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}

// 将 LineElement 注册到可扩展的 ElementTypeMap（仅类型信息）
declare module '@/types' {
  interface ElementTypeMap {
    line: LineElement
  }
}

// 将 LinePlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'line-plugin': LinePlugin
  }
}
