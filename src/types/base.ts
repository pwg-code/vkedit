import type { Component } from 'vue'
import type { EditorHost } from '@/core'

export interface Point2D {
  x: number
  y: number
}

export interface Size2D {
  width: number
  height: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// 图形组件接口
export interface IGraphicComponent {
  component: any
  props?: any
  events?: any
}

// 图形基础元素接口
export interface IGraphicElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  visible: boolean
  locked: boolean
  draggable: boolean
  transferable: boolean
  getBoundingBox(): BoundingBox
  clone(): IGraphicElement
  serialize(): any
  deserialize(data: any): void
  updateProperty(host: EditorHost, property: string, oldValue: any, newValue: any): void
  getTransformAttr?(event: any): { oldAttrs: any; newAttrs: any }
}

// 插件接口
export interface IEditorPlugin {
  name: string
  version: string
  install(host: EditorHost): void
  uninstall(): void
  activate?(): void
  deactivate?(): void
  // 注册图形类型
  registerGraphicTypes?(): IGraphicType[]
  // 提供工具栏工具
  getTools?(): IPluginTool[]
  [key: string]: any
}

export interface IPluginTool {
  [key: string]: any
}

// 图形构造器
export interface IGraphicType {
  type: string
  render(): Component // 渲染图形组件
  renderTool(): Component // 工具按钮
  renderPropertyPanel(): Component // 属性面板
  createElement(x: number, y: number): IGraphicElement // 实例化图形元素
}

// 编辑器状态
export interface IEditorState {
  zoom: number
  currentTool: string
  snapToGrid: boolean
  showGrid: boolean
  width: number
  height: number
  wmm: number
  hmm: number
  dpm: number
}

// 工具接口
export interface IToolbar {
  name: string
  getComponent(): Component
}

export type CursorMode = 'default' | 'hovering' | 'grab' | 'grabbing' | 'dragging'
