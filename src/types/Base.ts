import type { ICommand } from '@/commands/ICommand'
import type { Component } from 'vue'

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
  getBoundingBox(): BoundingBox
  clone(): IGraphicElement
  serialize(): any
  deserialize(data: any): void
  updateProperty(host: IEditorHost, property: string, oldValue: any, newValue: any): void
}

// 插件接口
export interface IEditorPlugin {
  name: string
  version: string
  install(host: IEditorHost): void
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
  // 变换器属性
  getTransformAttr(
    event: any,
    element: any,
  ): { oldAttrs: { [key: string]: any }; newAttrs: { [key: string]: any } }
}

// export interface IGraphicType {
//   type: string
//   name: string
//   icon: string
//   defaultProps?: any
//   getComponent(): Component
//   createElement(x: number, y: number): IGraphicElement
//   getTransformAttr?(
//     event: any,
//     element: any,
//   ): { oldAttrs: { [key: string]: any }; newAttrs: { [key: string]: any } }
// }

// 属性面板
export interface IPropertyPanel {
  type: string
  // forGraphicTypes?: string[] // 用于哪些图形类型
  title: string
  getComponent(): Component
}

// 属性面板(多个图形共用的)
export interface IPropertyPanelForGraphics {
  title: string
  forGraphics: string[] // 用于哪些图形类型
  getComponent(): Component
}

// 宿主接口
export interface IEditorHost {
  // 插件管理
  installPlugin(plugin: IEditorPlugin): void
  uninstallPlugin(pluginName: string): void
  getPlugin<T extends IEditorPlugin>(pluginName: string): T | null

  // 事件系统
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  emit(event: string, ...args: any[]): void

  // 命令系统
  executeCommand(command: ICommand): void
  undo(): void
  redo(): void

  // 状态管理
  getState(): IEditorState
  setState(state: Partial<IEditorState>): void

  // 导出json
  toJSON(): string

  // 从JSON加载
  loadJSON(jsonStr: string): void
}

// 编辑器状态
export interface IEditorState {
  zoom: number
  currentTool: string
  snapToGrid: boolean
  showGrid: boolean
  width: number
  height: number
}

// 工具接口
export interface IToolbar {
  name: string
  getComponent(): Component
}
