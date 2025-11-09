import { ref, reactive, computed } from 'vue'
import type {
  IEditorPlugin,
  IGraphicElement,
  IEditorState,
  EventMap,
  PluginEventData,
} from '../types'
import { EventUtils } from '../types/event-data'
import type { ICommand } from '@/commands/i-command'
import type { ElementManagerPlugin } from '@/plugins'
import type { Layer } from 'konva/lib/Layer'

export class EditorHost<T extends { [K in keyof T]: (payload: any) => void } = EventMap> {
  private plugins: Map<string, IEditorPlugin> = new Map()
  // private events: Map<string, Function[]> = new Map()
  private events: Partial<{ [K in keyof T]: T[K][] }> = {}
  private commandStack: ICommand[] = []
  private currentCommandIndex: number = -1
  public contentLayer: any
  public contentGroup: any
  public stage: any

  public state = reactive<IEditorState>({
    zoom: 1,
    currentTool: 'select',
    snapToGrid: true,
    showGrid: false,
    // 像素 = （毫米 * DPI）/ 25.4
    width: 400,
    height: 400,
    dpm: 8,
  })

  // 事件系统

  // 发送事件
  emit<K extends keyof T>(event: K, payload: Parameters<T[K]>[0]): void {
    const handlers = this.events[event]
    if (handlers) {
      handlers.forEach((handler) => handler(payload))
    }
  }

  // 订阅事件
  on<K extends keyof T>(event: K, handler: T[K]): void {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(handler)
  }

  // 取消订阅
  off<K extends keyof T>(event: K, handler: T[K]): void {
    if (!handler) {
      delete this.events[event]
      return
    }
    const handlers = this.events[event]
    if (handlers) this.events[event] = handlers.filter((h) => h !== handler) as any
  }

  // 插件管理
  installPlugin(plugin: IEditorPlugin): EditorHost<T> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return this
    }
    this.plugins.set(plugin.name, plugin)
    plugin.install(this as EditorHost<EventMap>)
    this.emit(
      'plugin:registered' as keyof T,
      {
        ...EventUtils.createBaseEventData('host'),
        plugin,
      } as PluginEventData,
    )

    return this
  }

  uninstallPlugin(pluginName: string): EditorHost<T> {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.uninstall()
      this.plugins.delete(pluginName)
      this.emit(
        'plugin:unregistered' as keyof T,
        {
          ...EventUtils.createBaseEventData('host'),
          plugin,
        } as PluginEventData,
      )
    }
    return this
  }

  getPlugin<T = any>(pluginName: string): T {
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName) as T
    } else {
      throw new Error(
        `不存在插件: ${pluginName},可用插件有: ${Array.from(this.plugins.keys()).join(',')}`,
      )
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
    this.emit('command:executed' as keyof T, { ...EventUtils.createBaseEventData('host'), command })
  }

  undo(): void {
    if (this.currentCommandIndex >= 0) {
      const command = this.commandStack[this.currentCommandIndex]
      command.undo()
      this.currentCommandIndex--
      this.emit('command:undone' as keyof T, { ...EventUtils.createBaseEventData('host'), command })
    }
  }

  redo(): void {
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.currentCommandIndex++
      const command = this.commandStack[this.currentCommandIndex]
      command.redo()
      this.emit('command:redone' as keyof T, { ...EventUtils.createBaseEventData('host'), command })
    }
  }

  // 状态管理
  getState(): IEditorState {
    return this.state
  }

  setState(newState: Partial<IEditorState>): void {
    Object.assign(this.state, newState)
    this.emit('state:changed' as keyof T, {
      ...EventUtils.createBaseEventData('host'),
      state: this.state,
    })
  }

  toJSON(): string {
    const elements = this.getPlugin<ElementManagerPlugin>('element-manager-plugin')?.elements
    const serializeElements: any[] = []
    if (elements) {
      elements.forEach((value, key) => {
        serializeElements.push(value.serialize())
      })
    }

    return JSON.stringify({
      state: this.state,
      elements: serializeElements,
    })
  }

  loadJSON(jsonStr: string): void {
    const data = JSON.parse(jsonStr)
    // 加载编辑器状态
    const elementsPlugin = this.getPlugin<ElementManagerPlugin>('element-manager-plugin')
    const elements: any[] = data.elements
    if (elementsPlugin) {
      elementsPlugin.elements.clear()
      // 加载所有图形元素
      elements.forEach((value) => {
        const e = elementsPlugin.createElement(value.type) // 先创建实例
        e.deserialize(value)
        elementsPlugin.addElement(e)
      })
      Object.assign(this.state, data.state)
    }
  }
}
