import { ref, reactive, computed } from 'vue'
import type { IEditorHost, IEditorPlugin, IGraphicElement, ICommand, IEditorState } from '../types'

export class EditorHost implements IEditorHost {
  private plugins: Map<string, IEditorPlugin> = new Map()
  private elements: Map<string, IGraphicElement> = new Map()
  private eventHandlers: Map<string, Function[]> = new Map()
  private commandStack: ICommand[] = []
  private currentCommandIndex: number = -1

  public state = reactive<IEditorState>({
    zoom: 1,
    currentTool: 'select',
    selectedElementIds: [],
    snapToGrid: true,
    showGrid: true,
  })

  // 画布操作
  addElement(element: IGraphicElement): void {
    this.elements.set(element.id, element)
    this.emit('element:added', element)
  }

  removeElement(elementId: string): void {
    const element = this.elements.get(elementId)
    if (element) {
      this.elements.delete(elementId)
      this.emit('element:removed', element)
    }
  }

  getElement(elementId: string): IGraphicElement | undefined {
    return this.elements.get(elementId)
  }

  getSelectedElements(): IGraphicElement[] {
    return this.state.selectedElementIds
      .map((id) => this.elements.get(id))
      .filter(Boolean) as IGraphicElement[]
  }

  clearSelection(): void {
    this.state.selectedElementIds = []
    this.emit('selection:changed')
  }

  // 插件管理
  registerPlugin(plugin: IEditorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return
    }

    this.plugins.set(plugin.name, plugin)
    plugin.install(this)
    this.emit('plugin:registered', plugin)
  }

  unregisterPlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.uninstall()
      this.plugins.delete(pluginName)
      this.emit('plugin:unregistered', plugin)
    }
  }

  getPlugin<T extends IEditorPlugin>(pluginName: string): IEditorPlugin {
    return this.plugins.get(pluginName) as T
  }

  // 事件系统
  // 订阅事件
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  // 取消订阅
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // 发送事件
  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(...args))
    }
  }

  // 命令系统
  executeCommand(command: ICommand): void {
    // 清楚redo栈
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.commandStack = this.commandStack.slice(0, this.currentCommandIndex + 1)
    }

    this.commandStack.push(command)
    this.currentCommandIndex++
    command.execute()

    this.emit('command:executed', command)
  }

  undo(): void {
    if (this.currentCommandIndex >= 0) {
      const command = this.commandStack[this.currentCommandIndex]
      command.undo()
      this.currentCommandIndex--
      this.emit('command:undone', command)
    }
  }

  redo(): void {
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.currentCommandIndex++
      const command = this.commandStack[this.currentCommandIndex]
      command.redo()
      this.emit('command:redone', command)
    }
  }

  // 状态管理
  getState(): IEditorState {
    return { ...this.state }
  }

  setState(newState: Partial<IEditorState>): void {
    Object.assign(this.state, newState)
    this.emit('state:changed', this.state)
  }

  // 获取所有元素
  getElements(): IGraphicElement[] {
    return [...this.elements.values()]
  }
}
