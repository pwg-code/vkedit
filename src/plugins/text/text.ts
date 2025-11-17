import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import type { Component } from 'vue'
import PropertyPanel from './PropertyPanel.vue'
import Shape from './Shape.vue'
import Tool from './Tool.vue'
import TextContextMenu from './TextContextMenu.vue'

// 矩形元素实现
export class TextElement extends BaseGraphicElement {
  public type = 'text'
  constructor(
    public x: number = 50,
    public y: number = 50,
    public text: string = '新建文本',
    public fontSize: number = 20,
    public align: 'left' | 'center' | 'right' | 'justify' = 'left',
    public verticalAlign: 'top' | 'middle' | 'bottom' = 'bottom',
    public fontStyle: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' = 'normal', // 文字加粗
  ) {
    super(x, y, 80, 20)
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
      createElement: () => new TextElement(),
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
