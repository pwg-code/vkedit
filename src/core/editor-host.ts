import { reactive } from 'vue'
import type { IEditorPlugin, IEditorState, EventMap, PluginEventData, PluginMap } from '../types'
import { EventUtils } from '../types/event-data'
import type { ICommand } from '@/commands/i-command'

export class EditorHost<
  T extends { [K in keyof T]: (payload: any) => void } = EventMap,
  U extends { [K in keyof U]: IEditorPlugin } = PluginMap,
> {
  private plugins: Map<keyof U, U[keyof U]> = new Map()
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
  installPlugin<K extends keyof U>(name: K, plugin: U[K]): EditorHost<T, U> {
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name as string} is already registered`)
      return this
    }
    this.plugins.set(name, plugin)
    plugin.install(this as unknown as EditorHost<any, any>)
    this.emit(
      'plugin:registered' as keyof T,
      {
        ...EventUtils.createBaseEventData('host'),
        plugin,
      } as PluginEventData,
    )

    return this
  }

  uninstallPlugin<K extends keyof U>(pluginName: K): EditorHost<T, U> {
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

  getPlugin<K extends keyof U>(pluginName: K): U[K] {
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName) as U[typeof pluginName]
    } else {
      throw new Error(
        `不存在插件: ${pluginName as string},可用插件有: ${Array.from(this.plugins.keys()).join(',')}`,
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
    // 发送事件
    this.emit('host:to-json:start' as keyof T, { timestamp: Date.now(), source: 'host' })
    try {
      const elementsPlugin = this.plugins.get('element-manager-plugin' as keyof U)
      const elements = elementsPlugin?.getAllElements()
      const serializeElements: any[] = []
      if (elements) {
        elements.forEach((value: any, key: any) => {
          serializeElements.push(value.serialize())
        })
      }
      return JSON.stringify({
        state: this.state,
        elements: serializeElements,
      })
    } catch (error) {
      this.emit('host:to-json:error' as keyof T, {
        timestamp: Date.now(),
        source: 'host',
        error: error as Error,
      })
      return ''
    } finally {
      this.emit('host:to-json:complete' as keyof T, { timestamp: Date.now(), source: 'host' })
    }
  }

  loadJSON(jsonStr: string): void {
    // 发送事件
    this.emit('host:load-json:start' as keyof T, { timestamp: Date.now(), source: 'host' })
    try {
      const data = JSON.parse(jsonStr)
      // 加载编辑器状态
      const elementsPlugin = this.getPlugin('element-manager-plugin' as keyof U)
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
    } catch (error) {
      this.emit('host:load-json:error' as keyof T, {
        timestamp: Date.now(),
        source: 'host',
        error: error as Error,
      })
      return
    }
    this.emit('host:load-json:complete' as keyof T, { timestamp: Date.now(), source: 'host' })
  }
}
