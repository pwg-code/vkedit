import { reactive } from 'vue'
import type { IEditorPlugin, IEditorState, EventMap, PluginEventData, PluginMap } from '../types'
import { EventUtils } from '../types/event-data'
import type { ICommand } from '@/commands/i-command'
import type { RectPlugin, TextPlugin } from '@/plugins'

export class EditorHost<
  T extends { [K in keyof T]: (payload: any) => void } = EventMap,
  U extends { [K in keyof U]: IEditorPlugin } = PluginMap,
> {
  // 运行时用一个通用 Map 存储插件实例（键为 string），编译时通过重载和泛型保证类型推断
  private plugins: Map<string, IEditorPlugin> = new Map()
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
    wmm: 50,
    hmm: 50,
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
  // installPlugin 支持两种用法：
  // 1) 通过 PluginMap 推断： installPlugin('rect-plugin', rectPlugin)
  // 2) 显式泛型以覆盖或在未知映射时指定类型： installPlugin<'my-plugin'>(name, plugin)
  installPlugin<K extends keyof PluginMap>(name: K, plugin: PluginMap[K]): EditorHost<T, U>
  installPlugin(name: string, plugin: IEditorPlugin): EditorHost<T, U>
  installPlugin(name: string, plugin: IEditorPlugin): EditorHost<T, U> {
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

  // uninstallPlugin 支持按映射键名或任意字符串调用
  uninstallPlugin<K extends keyof PluginMap>(pluginName: K): EditorHost<T, U>
  uninstallPlugin(pluginName: string): EditorHost<T, U>
  uninstallPlugin(pluginName: string): EditorHost<T, U> {
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

  // getPlugin 支持两种用法：
  // 1) 通过 PluginMap 推断返回类型： getPlugin('rect-plugin') -> RectPlugin
  // 2) 显式泛型： getPlugin<MyPlugin>('my-plugin')
  getPlugin<K extends keyof PluginMap>(pluginName: K): PluginMap[K]
  getPlugin<T extends IEditorPlugin = IEditorPlugin>(pluginName: string): T
  getPlugin(pluginName: string): IEditorPlugin {
    if (this.plugins.has(pluginName)) {
      return this.plugins.get(pluginName) as IEditorPlugin
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
    // 更新状态属性
    // 如果更新宽高 则需要重新计算毫米尺寸
    if (newState.width) {
      newState.wmm = newState.width / this.state.dpm
    }
    if (newState.height) {
      newState.hmm = newState.height / this.state.dpm
    }
    // 如果更新毫米尺寸 则需要重新计算像素宽高
    if (newState.wmm) {
      newState.width = newState.wmm * this.state.dpm
    }
    if (newState.hmm) {
      newState.height = newState.hmm * this.state.dpm
    }
    // 如果更新dpm 则需要重新计算宽高
    if (newState.dpm) {
      newState.width = this.state.wmm * newState.dpm
      newState.height = this.state.hmm * newState.dpm
    }
    Object.assign(this.state, newState)
    // 发送状态变更事件
    this.emit('state:changed' as keyof T, {
      ...EventUtils.createBaseEventData('host'),
      state: this.state,
    })
  }

  toJSON(): string {
    // 发送事件
    this.emit('host:to-json:start' as keyof T, { timestamp: Date.now(), source: 'host' })
    try {
      // 尝试通过 getPlugin 获取已安装的 element-manager-plugin（getPlugin 会在不存在时抛出）
      let elements: any[] | undefined
      try {
        const elementsPlugin = this.getPlugin('element-manager-plugin' as keyof PluginMap)
        elements = (elementsPlugin as any).getAllElements()
      } catch {
        elements = undefined
      }
      const serializeElements: any[] = []
      if (elements) {
        elements.forEach((value: any) => {
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
      // 抛出错误日志
      console.error('Export JSON failed:', error)
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
      const elementsPlugin = this.getPlugin('element-manager-plugin')
      const elements: any[] = data.elements
      if (elementsPlugin) {
        elementsPlugin.elements.clear()
        // 加载所有图形元素
        elements.forEach((value) => {
          const e = elementsPlugin.createElement(value.type) // 先创建实例并加入管理器
          e.deserialize(value)
        })
        Object.assign(this.state, data.state)
      }
    } catch (error) {
      this.emit('host:load-json:error' as keyof T, {
        timestamp: Date.now(),
        source: 'host',
        error: error as Error,
      })
      console.error('Load JSON failed:', error)
      return
    }
    this.emit('host:load-json:complete' as keyof T, { timestamp: Date.now(), source: 'host' })
  }
}

declare module '@/types' {
  interface PluginMap {
    ttt: RectPlugin
  }
}
function test() {
  const host = new EditorHost()
  const p = host.getPlugin('keydown-plugin')
  const t = host.getPlugin('selection-plugin')
}
