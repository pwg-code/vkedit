import { ref, reactive, computed } from 'vue'
import type { IEditorHost, IEditorPlugin, IGraphicElement, IEditorState } from '../types'
import { EditorEvents, EventUtils } from '../types/EventTypes'
import type { ICommand } from '@/commands/ICommand'

export class EditorHost implements IEditorHost {
  private plugins: Map<string, IEditorPlugin> = new Map()
  private elements: Map<string, IGraphicElement> = new Map()
  private eventHandlers: Map<string, Function[]> = new Map()
  private commandStack: ICommand[] = []
  private currentCommandIndex: number = -1

  public state = reactive<IEditorState>({
    zoom: 1,
    currentTool: 'select',
    snapToGrid: true,
    showGrid: false,
    width: 800,
    height: 800,
  })

  // 发送事件
  private emitEvent(event: EditorEvents, data?: any): void {
    const eventData = {
      ...EventUtils.createBaseEventData('host'),
      ...data,
    }
    this.emit(event, eventData)
  }

  // 发送事件
  emit(event: EditorEvents, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(...args))
    }
  }

  // 插件管理
  registerPlugin(plugin: IEditorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return
    }
    this.plugins.set(plugin.name, plugin)
    plugin.install(this)
    this.emitEvent(EditorEvents.PLUGIN_REGISTERED, { plugin })
  }

  unregisterPlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.uninstall()
      this.plugins.delete(pluginName)
      this.emitEvent(EditorEvents.PLUGIN_UNREGISTERED, { plugin })
    }
  }

  getPlugin<T = any>(pluginName: string): T | null {
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName) as T
    } else {
      console.warn('不存在插件' + pluginName)
      return null
    }
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

  // 命令系统
  executeCommand(command: ICommand): void {
    // 清楚redo栈
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.commandStack = this.commandStack.slice(0, this.currentCommandIndex + 1)
    }
    this.commandStack.push(command)
    this.currentCommandIndex++
    command.execute()
    this.emitEvent(EditorEvents.COMMAND_EXECUTED, { command })
  }

  undo(): void {
    if (this.currentCommandIndex >= 0) {
      const command = this.commandStack[this.currentCommandIndex]
      command.undo()
      this.currentCommandIndex--
      this.emitEvent(EditorEvents.COMMAND_UNDONE, { command })
    }
  }

  redo(): void {
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.currentCommandIndex++
      const command = this.commandStack[this.currentCommandIndex]
      command.redo()
      this.emitEvent(EditorEvents.COMMAND_REDONE, { command })
    }
  }

  // 状态管理
  getState(): IEditorState {
    return this.state
  }

  setState(newState: Partial<IEditorState>): void {
    Object.assign(this.state, newState)
    this.emitEvent(EditorEvents.STATE_CHANGED, { state: this.state })
  }

  // // 获取所有元素
  // getElements(): IGraphicElement[] {
  //   return [...this.elements.values()]
  // }
}
