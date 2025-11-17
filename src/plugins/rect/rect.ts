import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import type { Component } from 'vue'

// 矩形元素实现
export class RectElement extends BaseGraphicElement {
  [key: string]: any
  public type = 'rect'
  constructor(
    public x: number = 50,
    public y: number = 50,
    public fill: string = '',
    public stroke: string = '#000000',
    public strokeWidth: number = 2,
    public cornerRadius: number = 0,
  ) {
    super(x, y)
  }

  clone(): IGraphicElement {
    const newElement = new RectElement()
    newElement.deserialize(this)
    return newElement
  }

  serialize() {
    return {
      ...super.serialize(),
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      cornerRadius: this.cornerRadius,
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
      createElement: () => new RectElement(),
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
