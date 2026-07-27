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
  resizable: boolean
  // 层级排序依据：数值越大越在顶层
  zIndex: number
  /** 元素自定义显示名称。空字符串/null 时回退到 layer-manager.getElementDisplayName 的自动命名逻辑。 */
  displayName?: string | null
  resizeAnchors?: string[] | null
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
  [key: string]: any
}

// 编辑器状态
export interface IEditorState {
  zoom: number
  currentTool: string
  snapToGrid: boolean
  snapRotation: boolean
  showGrid: boolean
  width: number
  height: number
  wmm: number
  hmm: number
  dpm: number
}

// 舞台交互状态（非序列化，按 EditorHost 实例隔离）
export interface IStageState {
  // 视口尺寸（由 StageView 测量后同步写入，区别于 IEditorState.width/height 文档画布尺寸）
  viewportWidth: number
  viewportHeight: number
  // 舞台外层 DOM 元素（由 StageView 在 onMounted 写入，供 hook 读取）
  wrapperEl: HTMLElement | null
  currentCursorMode: CursorMode
  mouseStageX: number
  mouseStageY: number
  spacePressed: boolean
  isPanning: boolean
  offsetX: number
  offsetY: number
  // 瞬态标记：loadJSON 成功后置位，待视口尺寸就绪后由 StageView 补执行一次自适应。
  // 不进入 toJSON / loadJSON（非序列化），仅存于运行时实例，规避 StageView 重挂载导致局部状态丢失。
  autoFitPending: boolean
}

// 工具接口
export interface IToolbar {
  name: string
  getComponent(): Component
}

export type CursorMode = 'default' | 'hovering' | 'grab' | 'grabbing' | 'dragging'
