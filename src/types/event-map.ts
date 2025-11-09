import type {
  BaseEventData,
  ElementEventData,
  SelectionEventData,
  TransformEventData,
  ToolEventData,
  PluginEventData,
  CommandEventData,
  HistoryEventData,
  ViewEventData,
  CreationEventData,
  ErrorEventData,
  PerformanceEventData,
  PropertyRegisteredPanelEventData,
  AlignEventData,
  LayerOrderEventData,
  ElementUpdateEventData,
  StageMouseEventData,
  StageKeyboardEventData,
  GraphicRegisteredEventData,
  GraphicToolRegisteredEventData,
  ElementRegisteredEventData,
  ContextMenuRegisteredEventData
} from './event-data'

/**
 *
 * 说明：event-types.ts 中只定义了有限的几类事件数据接口。
 * 对于没有专用接口的事件，我们使用 BaseEventData 作为默认类型。
 */
export interface EventMap {
  // 生命周期
  'editor:ready': (payload: BaseEventData) => void
  'editor:destroy': (payload: BaseEventData) => void
  'editor:reset': (payload: BaseEventData) => void

  // 文件操作
  'file:new': (payload: BaseEventData) => void
  'file:open': (payload: BaseEventData) => void
  'file:save': (payload: BaseEventData) => void
  'file:save-as': (payload: BaseEventData) => void
  'file:export': (payload: BaseEventData) => void
  'file:import': (payload: BaseEventData) => void
  'file:loaded': (payload: BaseEventData) => void
  'file:saved': (payload: BaseEventData) => void
  'file:modified-change': (payload: BaseEventData) => void

  // 舞台交互
  'stage:mousedown': (payload: StageMouseEventData) => void
  'stage:mousemove': (payload: StageMouseEventData) => void
  'stage:mouseup': (payload: StageMouseEventData) => void
  'stage:click': (payload: StageMouseEventData) => void
  'stage:dblclick': (payload: StageMouseEventData) => void
  'stage:contextmenu': (payload: StageMouseEventData) => void
  'stage:mouseenter': (payload: StageMouseEventData) => void
  'stage:mouseleave': (payload: StageMouseEventData) => void
  'stage:wheel': (payload: StageMouseEventData) => void

  'stage:dragstart': (payload: StageMouseEventData) => void
  'stage:dragend': (payload: StageMouseEventData) => void

  'stage:keydown': (payload: StageKeyboardEventData) => void
  'stage:keydown-delete': (payload: StageKeyboardEventData) => void
  'stage:keydown-left': (payload: StageKeyboardEventData) => void
  'stage:keydown-right': (payload: StageKeyboardEventData) => void
  'stage:keydown-up': (payload: StageKeyboardEventData) => void
  'stage:keydown-down': (payload: StageKeyboardEventData) => void

  // 工具
  'tool:changed': (payload: ToolEventData) => void
  'tool:activated': (payload: ToolEventData) => void
  'tool:registered': (payload: ToolEventData) => void
  'tool:unregistered': (payload: ToolEventData) => void

  // 图形元素
  'element:registered': (payload: ElementRegisteredEventData) => void
  'element:unregistered': (payload: ElementRegisteredEventData) => void
  'element:added': (payload: ElementEventData) => void
  'element:removed': (payload: ElementEventData) => void
  'element:selected': (payload: ElementEventData) => void
  'element:deselected': (payload: ElementEventData) => void
  'element:transformed': (payload: TransformEventData) => void
  'element:updated': (payload: ElementUpdateEventData) => void
  'element:copied': (payload: ElementEventData) => void
  'element:pasted': (payload: ElementEventData) => void
  'element:cloned': (payload: ElementEventData) => void
  'element:locked-change': (payload: ElementEventData) => void
  'element:visibility-change': (payload: ElementEventData) => void
  'element:zindex-change': (payload: ElementEventData) => void

  // 选择
  'selection:changed': (payload: SelectionEventData) => void
  'selection:cleared': (payload: SelectionEventData) => void
  'selection:multi-change': (payload: SelectionEventData) => void

  // 创建过程
  'creation:started': (payload: CreationEventData) => void
  'creation:updated': (payload: CreationEventData) => void
  'creation:completed': (payload: CreationEventData) => void
  'creation:cancelled': (payload: CreationEventData) => void

  // 视图
  'view:zoom-change': (payload: ViewEventData) => void
  'view:pan': (payload: ViewEventData) => void
  'view:zoom-to-fit': (payload: ViewEventData) => void
  'view:reset': (payload: ViewEventData) => void
  'view:grid-visibility-change': (payload: ViewEventData) => void
  'view:snap-change': (payload: ViewEventData) => void
  'view:ruler-visibility-change': (payload: ViewEventData) => void

  // 图层
  'layer:added': (payload: BaseEventData) => void
  'layer:removed': (payload: BaseEventData) => void
  'layer:order-changed': (payload: LayerOrderEventData) => void
  'layer:visibility-change': (payload: BaseEventData) => void
  'layer:locked-change': (payload: BaseEventData) => void
  'layer:active-change': (payload: BaseEventData) => void

  // 命令历史
  'command:executed': (payload: CommandEventData) => void
  'command:undone': (payload: CommandEventData) => void
  'command:redone': (payload: CommandEventData) => void
  'history:changed': (payload: HistoryEventData) => void
  'history:cleared': (payload: HistoryEventData) => void

  // 插件系统
  'plugin:registered': (payload: PluginEventData) => void
  'plugin:unregistered': (payload: PluginEventData) => void
  'plugin:activated': (payload: PluginEventData) => void
  'plugin:deactivated': (payload: PluginEventData) => void
  'plugin:loaded': (payload: PluginEventData) => void
  'plugin:error': (payload: ErrorEventData) => void

  'graphic:registered': (payload: GraphicRegisteredEventData) => void
  'graphic:unregistered': (payload: GraphicRegisteredEventData) => void
  'graphic-tool:registered': (payload: GraphicToolRegisteredEventData) => void
  'graphic-tool:unregistered': (payload: GraphicToolRegisteredEventData) => void

  // 创建策略
  'create-strategy:registered': (payload: BaseEventData) => void
  'create-strategy:unregistered': (payload: BaseEventData) => void
  'create-strategy:needs-register': (payload: BaseEventData) => void

  // 属性面板
  'property-panel:registered': (payload: PropertyRegisteredPanelEventData) => void
  'property-panel:unregistered': (payload: PropertyRegisteredPanelEventData) => void
  'property:value-change': (payload: BaseEventData) => void
  'property:batch-update-start': (payload: BaseEventData) => void
  'property:batch-update-end': (payload: BaseEventData) => void

  // 对齐分布
  'elements:align': (payload: AlignEventData) => void
  'elements:distribute': (payload: BaseEventData) => void
  'elements:group': (payload: BaseEventData) => void
  'elements:ungroup': (payload: BaseEventData) => void
  'elements:layer': (payload: LayerOrderEventData) => void

  // 快捷键
  'shortcut:triggered': (payload: BaseEventData) => void
  'shortcut:registered': (payload: BaseEventData) => void
  'shortcut:conflict': (payload: BaseEventData) => void

  // 剪贴板
  'clipboard:copy': (payload: BaseEventData) => void
  'clipboard:paste': (payload: BaseEventData) => void
  'clipboard:cut': (payload: BaseEventData) => void
  'clipboard:clear': (payload: BaseEventData) => void

  // 状态管理
  'state:changed': (payload: BaseEventData) => void
  'state:saved': (payload: BaseEventData) => void
  'state:restored': (payload: BaseEventData) => void

  // 错误
  'editor:error': (payload: ErrorEventData) => void
  'operation:error': (payload: ErrorEventData) => void
  'resource:load-error': (payload: ErrorEventData) => void
  'plugin:load-error': (payload: ErrorEventData) => void

  // 性能
  'performance:warning': (payload: PerformanceEventData) => void
  'memory:warning': (payload: PerformanceEventData) => void
  'render:performance': (payload: PerformanceEventData) => void

  // 导出
  'export:start': (payload: BaseEventData) => void
  'export:complete': (payload: BaseEventData) => void
  'export:error': (payload: ErrorEventData) => void
  'export:progress': (payload: BaseEventData) => void

  // 导入
  'import:start': (payload: BaseEventData) => void
  'import:complete': (payload: BaseEventData) => void
  'import:error': (payload: ErrorEventData) => void
  'import:progress': (payload: BaseEventData) => void

  // 协作
  'collab:connected': (payload: BaseEventData) => void
  'collab:disconnected': (payload: BaseEventData) => void
  'collab:data-received': (payload: BaseEventData) => void
  'collab:operation-sync': (payload: BaseEventData) => void

  // 预览
  'preview:start': (payload: BaseEventData) => void
  'preview:complete': (payload: BaseEventData) => void
  'preview:error': (payload: ErrorEventData) => void

  // 上下文菜单注册
  'context-menu:registered': (payload: ContextMenuRegisteredEventData) => void
  'context-menu:unregistered': (payload: ContextMenuRegisteredEventData) => void

  // 自定义（插件）
  'custom:': (...args: any[]) => any
}


/** 类型安全的事件总线实现示例，基于上面的 EventMap */
export class EventBus<T extends { [K in keyof T]: (payload: any) => void }> {
  private events: Partial<{ [K in keyof T]: T[K][] }> = {}

  on<K extends keyof T>(event: K, callback: T[K]): void {
    if (!this.events[event]) this.events[event] = []
    this.events[event]!.push(callback)
  }

  emit<K extends keyof T>(event: K, payload: Parameters<T[K]>[0]): void {
    const callbacks = this.events[event]
    if (callbacks) callbacks.forEach(cb => cb(payload))
  }

  off<K extends keyof T>(event: K, callback?: T[K]): void {
    if (!callback) {
      delete this.events[event]
      return
    }
    const callbacks = this.events[event]
    if (callbacks) this.events[event] = callbacks.filter(cb => cb !== callback) as any
  }
}


// 导出默认映射名，方便其他模块按需使用
// 注意：EventMap 是类型接口（非运行时值），因此不做默认导出。
// 如果需要一个运行时事件名数组或映射，可在此处添加额外导出。
