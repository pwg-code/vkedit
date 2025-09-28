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
  rotation: number
  scaleX: number
  scaleY: number
  visible: boolean
  locked: boolean

  getComponent(): IGraphicComponent
  getBoundingBox(): BoundingBox
  clone(): IGraphicElement
  serialize(): any
  deserialize(data: any): void
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
}

export interface IPluginTool {
  [key: string]: any
}

export interface IGraphicType {
  type: string
  name: string
  icon: string
  component: any
  defaultProps: any
  createElement?(x: number, y: number): IGraphicElement
}

// 宿主接口
export interface IEditorHost {
  // 画布操作
  addElement(element: IGraphicElement): void
  removeElement(elementId: string): void
  getElement(elementId: string): IGraphicElement | undefined
  getElements(): IGraphicElement[]
  getSelectedElements(): IGraphicElement[]
  clearSelection(): void

  // 插件管理
  registerPlugin(plugin: IEditorPlugin): void
  unregisterPlugin(pluginName: string): void
  getPlugin<T extends IEditorPlugin>(pluginName: string): IEditorPlugin

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
}

// 命令接口
export interface ICommand {
  name: string
  execute(): void
  undo(): void
  redo(): void
}

// 编辑器状态
export interface IEditorState {
  zoom: number
  currentTool: string
  selectedElementIds: string[]
  snapToGrid: boolean
  showGrid: boolean
}
