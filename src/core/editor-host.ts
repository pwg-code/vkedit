import { reactive } from 'vue'
import type { IEditorPlugin, IEditorState, EventMap, PluginEventData, PluginMap } from '../types'
import { EventUtils } from '../types/event-data'
import type { ICommand } from '@/commands/i-command'
import { RectPlugin, TextPlugin } from '@/plugins'

export class EditorHost {
  // 运行时用一个通用 Map 存储插件实例（键为 string），编译时通过重载和泛型保证类型推断
  private plugins: Map<string, IEditorPlugin> = new Map()
  private events: Map<string, Function[]> = new Map()
  private commandStack: ICommand[] = []
  private currentCommandIndex: number = -1
  public contentLayer: any
  public contentGroup: any
  public stage: any

  private _status = reactive<IEditorState>({
    zoom: 1,
    currentTool: 'select',
    snapToGrid: true,
    showGrid: false,
    // 像素 = 毫米 * DPM
    width: 400,
    height: 400,
    wmm: 50,
    hmm: 50,
    dpm: 8,
  })

  // 事件系统

  // 发送事件
  emit<K extends keyof EventMap>(event: K, payload: Parameters<EventMap[K]>[0]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(payload))
    }
  }

  // 订阅事件
  on<K extends keyof EventMap>(event: K, handler: EventMap[K]): void {
    if (!this.events.has(event)) this.events.set(event, [])
    this.events.get(event)!.push(handler)
  }

  // 取消订阅
  off<K extends keyof EventMap>(event: K, handler: EventMap[K]): void {
    if (!handler) {
      this.events.delete(event)
      return
    }
    const handlers = this.events.get(event)
    if (handlers)
      this.events.set(
        event,
        handlers.filter((h) => h !== handler),
      )
  }

  // 插件管理
  // installPlugin 支持两种用法：
  // 1) 通过 PluginMap 推断： installPlugin('rect-plugin', rectPlugin)
  // 2) 显式泛型以覆盖或在未知映射时指定类型： installPlugin<'my-plugin'>(name, plugin)
  installPlugin<K extends keyof PluginMap>(
    name: K,
    pluginClass: PluginMap[K] | (new (...args: any[]) => PluginMap[K]),
  ): EditorHost
  installPlugin(
    name: string,
    pluginClass: IEditorPlugin | (new (...args: any[]) => IEditorPlugin),
  ): EditorHost
  installPlugin(name: string, pluginClass: any): EditorHost {
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name} is already registered`)
      return this
    }
    // pluginClass 必须是一个类
    const pluginInstance: IEditorPlugin = new pluginClass(this)
    this.plugins.set(name, pluginInstance)
    pluginInstance.install(this)
    this.emit('plugin:registered', {
      ...EventUtils.createBaseEventData('host'),
      plugin: pluginInstance,
    })

    return this
  }

  // uninstallPlugin 支持按映射键名或任意字符串调用
  uninstallPlugin<K extends keyof PluginMap>(pluginName: K): EditorHost
  uninstallPlugin(pluginName: string): EditorHost
  uninstallPlugin(pluginName: string): EditorHost {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      plugin.uninstall()
      this.plugins.delete(pluginName)
      this.emit('plugin:unregistered', {
        ...EventUtils.createBaseEventData('host'),
        plugin,
      })
    }
    return this
  }

  // getPlugin 支持两种用法：
  // 1) 通过 PluginMap 推断返回类型： getPlugin('rect-plugin') -> RectPlugin
  // 2) 显式泛型： getPlugin<MyPlugin>('my-plugin')
  getPlugin<K extends keyof PluginMap>(pluginName: K): PluginMap[K]
  getPlugin<T extends IEditorPlugin = IEditorPlugin>(pluginName: string): T
  getPlugin(pluginName: string): IEditorPlugin {
    const p = this.plugins.get(pluginName)
    if (p) {
      return p
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
    this.emit('command:executed', { ...EventUtils.createBaseEventData('host'), command })
  }

  undo(): void {
    if (this.currentCommandIndex >= 0) {
      const command = this.commandStack[this.currentCommandIndex]
      command.undo()
      this.currentCommandIndex--
      this.emit('command:undone', { ...EventUtils.createBaseEventData('host'), command })
    }
  }

  redo(): void {
    if (this.currentCommandIndex < this.commandStack.length - 1) {
      this.currentCommandIndex++
      const command = this.commandStack[this.currentCommandIndex]
      command.redo()
      this.emit('command:redone', { ...EventUtils.createBaseEventData('host'), command })
    }
  }

  public get status(): IEditorState {
    return this._status
  }

  setStatus(newStatus: Partial<IEditorState>) {
    Object.assign(this._status, newStatus)
    if (newStatus.width) {
      this._status.wmm = newStatus.width / this._status.dpm
    }
    if (newStatus.height) {
      this._status.hmm = newStatus.height / this._status.dpm
    }
    // 如果更新毫米尺寸 则需要重新计算像素宽高
    if (newStatus.wmm) {
      this._status.width = newStatus.wmm * this._status.dpm
    }
    if (newStatus.hmm) {
      this._status.height = newStatus.hmm * this._status.dpm
    }
    // 如果更新dpm 则需要重新计算宽高
    if (newStatus.dpm) {
      this._status.width = this.status.wmm * newStatus.dpm
      this._status.height = this.status.hmm * newStatus.dpm
    }

    this.emit('host:status-changed', {
      ...EventUtils.createBaseEventData('host'),
      status: this._status,
    })
  }

  toJSON(): string {
    // 发送事件
    this.emit('host:to-json:start', { timestamp: Date.now(), source: 'host' })
    try {
      // 尝试通过 getPlugin 获取已安装的 element-manager-plugin（getPlugin 会在不存在时抛出）
      let elements: any[] | undefined
      try {
        const elementsPlugin = this.getPlugin('element-manager-plugin')
        elements = elementsPlugin.getAllElements()
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
        state: this.status,
        elements: serializeElements,
      })
    } catch (error) {
      this.emit('host:to-json:error', {
        timestamp: Date.now(),
        source: 'host',
        error: error as Error,
      })
      // 抛出错误日志
      console.error('Export JSON failed:', error)
      return ''
    } finally {
      this.emit('host:to-json:complete', { timestamp: Date.now(), source: 'host' })
    }
  }

  loadJSON(jsonStr: string): void {
    // 发送事件
    this.emit('host:load-json:start', { timestamp: Date.now(), source: 'host' })
    try {
      const data = JSON.parse(jsonStr)
      // 加载编辑器状态
      const elementsPlugin = this.getPlugin('element-manager-plugin')
      const elements: any[] = data.elements
      if (elementsPlugin) {
        elementsPlugin.elements.clear()
        // 加载所有图形元素
        elements.forEach((value) => {
          const e = elementsPlugin.createElement(value.type) // 先创建实例
          e.deserialize(value)
          e.id = value.id // 保留 JSON 中的原 id（deserialize 不再复制 id）
          elementsPlugin.addElement(e)
        })
        Object.assign(this.status, data.state)
      }
    } catch (error) {
      this.emit('host:load-json:error', {
        timestamp: Date.now(),
        source: 'host',
        error: error as Error,
      })
      console.error('Load JSON failed:', error)
      return
    }
    this.emit('host:load-json:complete', { timestamp: Date.now(), source: 'host' })
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
  host.installPlugin('456', TextPlugin)
  host.uninstallPlugin('456')
}
