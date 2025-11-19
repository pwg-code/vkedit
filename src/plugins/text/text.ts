import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import { BaseGraphicElement, type BaseGraphicElementOptions } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import TextContextMenu from './TextContextMenu.vue'

export interface TextOptions extends BaseGraphicElementOptions {
  x?: number
  y?: number
  text?: string
  fontSize?: number
  align?: 'left' | 'center' | 'right' | 'justify'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  fontStyle?: 'normal' | 'italic' | 'bold' | '500' | 'italic bold'
  xmm?: number
  ymm?: number
}

// 矩形元素实现
export class TextElement extends BaseGraphicElement {
  public type = 'text'
  public text: string = '新建文本'
  public fontSize: number = 20
  public align: 'left' | 'center' | 'right' | 'justify' = 'left'
  public verticalAlign: 'top' | 'middle' | 'bottom' = 'bottom'
  public fontStyle: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' = 'normal'

  constructor(options: Partial<TextOptions> = {}) {
    super({
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
      transferable: options.transferable,
      host: options.host,
    })
    this.text = options.text ?? this.text
    this.fontSize = options.fontSize ?? this.fontSize
    this.align = options.align ?? this.align
    this.verticalAlign = options.verticalAlign ?? this.verticalAlign
    this.fontStyle = options.fontStyle ?? this.fontStyle
  }

  public get config() {
    return {
      ...super.config,
      text: this.text,
      fontSize: this.fontSize,
      align: this.align,
      verticalAlign: this.verticalAlign,
      fontStyle: this.fontStyle,
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      text: this.text,
      fontSize: this.fontSize,
      align: this.align,
      verticalAlign: this.verticalAlign,
      fontStyle: this.fontStyle,
    }
  }
}

export class TextPlugin extends BasePlugin {
  public name = 'text-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 图形工具
    this.host.emit('graphic-tool:registered', {
      type: 'text',
      render: () => Tool,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册图形
    this.host.emit('graphic:registered', {
      type: 'text',
      render: () => Shape,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册属性面板
    this.host.emit('property-panel:registered', {
      graphicTypes: ['text'],
      render: () => PropertyPanel,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })
    // 注册元素构造器
    this.host.emit('element:registered', {
      type: 'text',
      createElement: () => new TextElement({ host: this.host }),
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册一个上下文菜单
    this.host.emit('context-menu:registered', {
      graphicTypes: ['text'],
      render: () => TextContextMenu,
      isPublic: false,
      isCanvas: false,
      source: 'text-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}

// 将 TextElement 注册到可扩展的 ElementTypeMap（仅类型信息）
declare module '@/types' {
  interface ElementTypeMap {
    text: TextElement
  }
}

// 将 TextPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'text-plugin': TextPlugin
  }
}
