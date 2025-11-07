/**
 * 编辑器事件枚举
 * 按照功能模块分类，确保事件名唯一性
 */
export enum EditorEvents {
  // ==================== 生命周期事件 ====================
  /** 编辑器初始化完成 */
  EDITOR_READY = 'editor:ready',
  /** 编辑器销毁 */
  EDITOR_DESTROY = 'editor:destroy',
  /** 编辑器重置 */
  EDITOR_RESET = 'editor:reset',

  // ==================== 文件操作事件 ====================
  /** 新建文件 */
  FILE_NEW = 'file:new',
  /** 打开文件 */
  FILE_OPEN = 'file:open',
  /** 保存文件 */
  FILE_SAVE = 'file:save',
  /** 另存为 */
  FILE_SAVE_AS = 'file:save-as',
  /** 导出文件 */
  FILE_EXPORT = 'file:export',
  /** 导入文件 */
  FILE_IMPORT = 'file:import',
  /** 文件加载完成 */
  FILE_LOADED = 'file:loaded',
  /** 文件保存完成 */
  FILE_SAVED = 'file:saved',
  /** 文件修改状态改变 */
  FILE_MODIFIED_CHANGE = 'file:modified-change',

  // ==================== 画布交互事件 ====================
  /** 画布鼠标按下 */
  CANVAS_MOUSE_DOWN = 'canvas:mousedown',
  /** 画布鼠标移动 */
  CANVAS_MOUSE_MOVE = 'canvas:mousemove',
  /** 画布鼠标抬起 */
  CANVAS_MOUSE_UP = 'canvas:mouseup',
  /** 画布点击 */
  CANVAS_CLICK = 'canvas:click',
  /** 画布双击 */
  CANVAS_DOUBLE_CLICK = 'canvas:dblclick',
  /** 画布右键点击 */
  CANVAS_CONTEXTMENU = 'canvas:contextmenu',
  /** 画布鼠标进入 */
  CANVAS_MOUSE_ENTER = 'canvas:mouseenter',
  /** 画布鼠标离开 */
  CANVAS_MOUSE_LEAVE = 'canvas:mouseleave',
  /** 画布滚轮事件 */
  CANVAS_WHEEL = 'canvas:wheel',
  /** 画布拖拽开始 */
  CANVAS_DRAG_START = 'canvas:dragstart',
  /** 画布拖拽结束 */
  CANVAS_DRAG_END = 'canvas:dragend',
  /** 按下键盘 */
  CANVAS_KEYDOWN = 'canvas:keydown',
  /** 按下删除键 */
  CANVAS_KEYDOWN_DELETE = 'canvas:keydown-delete',
  /** 按下方向键左 */
  CANVAS_KEYDOWN_LEFT = 'canvas:keydown-left',
  /** 按下方向键右 */
  CANVAS_KEYDOWN_RIGHT = 'canvas:keydown-right',
  /** 按下方向键上 */
  CANVAS_KEYDOWN_UP = 'canvas:keydown-up',
  /** 按下方向键下 */
  CANVAS_KEYDOWN_DOWN = 'canvas:keydown-down',

  // ==================== 工具事件 ====================
  /** 工具改变 */
  TOOL_CHANGED = 'tool:changed',
  /** 工具激活 */
  TOOL_ACTIVATED = 'tool:activated',
  /** 工具注册 */
  TOOL_REGISTERED = 'tool:registered',
  /** 工具注销 */
  TOOL_UNREGISTERED = 'tool:unregistered',

  // ==================== 图形元素事件 ====================
  /** 元素添加 */
  ELEMENT_ADDED = 'element:added',
  /** 元素删除 */
  ELEMENT_REMOVED = 'element:removed',
  /** 元素选中 */
  ELEMENT_SELECTED = 'element:selected',
  /** 元素取消选中 */
  ELEMENT_DESELECTED = 'element:deselected',
  /** 元素变换（移动、缩放、旋转） */
  ELEMENT_TRANSFORMED = 'element:transformed',
  /** 元素属性更新 */
  ELEMENT_UPDATED = 'element:updated',
  /** 元素复制 */
  ELEMENT_COPIED = 'element:copied',
  /** 元素粘贴 */
  ELEMENT_PASTED = 'element:pasted',
  /** 元素克隆 */
  ELEMENT_CLONED = 'element:cloned',
  /** 元素锁定状态改变 */
  ELEMENT_LOCKED_CHANGE = 'element:locked-change',
  /** 元素可见性改变 */
  ELEMENT_VISIBILITY_CHANGE = 'element:visibility-change',
  /** 元素层级改变 */
  ELEMENT_ZINDEX_CHANGE = 'element:zindex-change',

  // ==================== 选择事件 ====================
  /** 选择改变 */
  SELECTION_CHANGED = 'selection:changed',
  /** 选择清空 */
  SELECTION_CLEARED = 'selection:cleared',
  /** 多选模式改变 */
  SELECTION_MULTI_CHANGE = 'selection:multi-change',

  // ==================== 创建过程事件 ====================
  /** 创建开始 */
  CREATION_STARTED = 'creation:started',
  /** 创建更新 */
  CREATION_UPDATED = 'creation:updated',
  /** 创建完成 */
  CREATION_COMPLETED = 'creation:completed',
  /** 创建取消 */
  CREATION_CANCELLED = 'creation:cancelled',

  // ==================== 视图事件 ====================
  /** 缩放改变 */
  VIEW_ZOOM_CHANGE = 'view:zoom-change',
  /** 视图平移 */
  VIEW_PAN = 'view:pan',
  /** 视图适应画布 */
  VIEW_ZOOM_TO_FIT = 'view:zoom-to-fit',
  /** 视图重置 */
  VIEW_RESET = 'view:reset',
  /** 网格显示状态改变 */
  VIEW_GRID_VISIBILITY_CHANGE = 'view:grid-visibility-change',
  /** 吸附功能状态改变 */
  VIEW_SNAP_CHANGE = 'view:snap-change',
  /** 标尺显示状态改变 */
  VIEW_RULER_VISIBILITY_CHANGE = 'view:ruler-visibility-change',

  // ==================== 图层事件 ====================
  /** 图层添加 */
  LAYER_ADDED = 'layer:added',
  /** 图层删除 */
  LAYER_REMOVED = 'layer:removed',
  /** 图层顺序改变 */
  LAYER_ORDER_CHANGED = 'layer:order-changed',
  /** 图层可见性改变 */
  LAYER_VISIBILITY_CHANGE = 'layer:visibility-change',
  /** 图层锁定状态改变 */
  LAYER_LOCKED_CHANGE = 'layer:locked-change',
  /** 当前图层改变 */
  LAYER_ACTIVE_CHANGE = 'layer:active-change',

  // ==================== 命令历史事件 ====================
  /** 命令执行 */
  COMMAND_EXECUTED = 'command:executed',
  /** 命令撤销 */
  COMMAND_UNDONE = 'command:undone',
  /** 命令重做 */
  COMMAND_REDONE = 'command:redone',
  /** 历史状态改变 */
  HISTORY_CHANGED = 'history:changed',
  /** 历史清空 */
  HISTORY_CLEARED = 'history:cleared',

  // ==================== 插件系统事件 ====================
  /** 插件注册 */
  PLUGIN_REGISTERED = 'plugin:registered',
  /** 插件注销 */
  PLUGIN_UNREGISTERED = 'plugin:unregistered',
  /** 插件激活 */
  PLUGIN_ACTIVATED = 'plugin:activated',
  /** 插件停用 */
  PLUGIN_DEACTIVATED = 'plugin:deactivated',
  /** 插件加载完成 */
  PLUGIN_LOADED = 'plugin:loaded',
  /** 插件错误 */
  PLUGIN_ERROR = 'plugin:error',

  // ==================== 图形类型事件 ====================
  /** 图形类型注册 */
  GRAPHIC_TYPE_REGISTERED = 'graphic-type:registered',
  /** 图形类型注销 */
  GRAPHIC_TYPE_UNREGISTERED = 'graphic-type:unregistered',

  // ==================== 创建策略事件 ====================

  /** 创建策略注册 */
  CREATE_STRATEGY_REGISTERED = 'create-strategy:registered',
  /** 创建策略注销 */
  CREATE_STRATEGY_UNREGISTERED = 'create-strategy:unregistered',
  /** 创建策略需要注册 */
  CREATE_STRATEGY_NEEDS_REGISTER = 'create-strategy:needs-register',

  // ==================== 属性面板事件 ====================
  /** 属性面板注册(画布) */
  PROPERTY_PANEL_CANVAS_REGISTERED = 'property-panel-canvas:registered',
  /** 属性面板注销(画布) */
  PROPERTY_PANEL_CANVAS_UNREGISTERED = 'property-panel-canvas:unregistered',
  /** 属性面板注册(公用) 选择任何元素都会显示的 */
  PROPERTY_PANEL_PUBLIC_REGISTERED = 'property-panel-public:registered',
  /** 属性面板注销(公用) 选择任何元素都会显示的 */
  PROPERTY_PANEL_PUBLIC_UNREGISTERED = 'property-panel-public:unregistered',
  /** 属性面板注册(多个图形公用的) */
  PROPERTY_PANEL_FOR_GRAPHICS_REGISTERED = 'property-panel-for-graphics:registered',
  /** 属性面板注销(多个图形公用的) */
  PROPERTY_PANEL_FOR_GRAPHICS_UNREGISTERED = 'property-panel-for-graphics:unregistered',
  /** 属性面板注册(选中单个元素时显示的) */
  PROPERTY_PANEL_REGISTERED = 'property-panel:registered',
  /** 属性面板注销 */
  PROPERTY_PANEL_UNREGISTERED = 'property-panel:unregistered',
  /** 属性值改变 */
  PROPERTY_VALUE_CHANGE = 'property:value-change',
  /** 属性批量更新开始 */
  PROPERTY_BATCH_UPDATE_START = 'property:batch-update-start',
  /** 属性批量更新结束 */
  PROPERTY_BATCH_UPDATE_END = 'property:batch-update-end',

  // ==================== 对齐分布事件 ====================
  /** 元素对齐 */
  ELEMENTS_ALIGN = 'elements:align',
  /** 元素分布 */
  ELEMENTS_DISTRIBUTE = 'elements:distribute',
  /** 元素组合 */
  ELEMENTS_GROUP = 'elements:group',
  /** 元素取消组合 */
  ELEMENTS_UNGROUP = 'elements:ungroup',
  /** 元素层级调整 */
  ELEMENTS_LAYER = 'elements:layer',

  // ==================== 快捷键事件 ====================
  /** 快捷键触发 */
  SHORTCUT_TRIGGERED = 'shortcut:triggered',
  /** 快捷键注册 */
  SHORTCUT_REGISTERED = 'shortcut:registered',
  /** 快捷键冲突 */
  SHORTCUT_CONFLICT = 'shortcut:conflict',

  // ==================== 剪贴板事件 ====================
  /** 复制到剪贴板 */
  CLIPBOARD_COPY = 'clipboard:copy',
  /** 从剪贴板粘贴 */
  CLIPBOARD_PASTE = 'clipboard:paste',
  /** 剪切到剪贴板 */
  CLIPBOARD_CUT = 'clipboard:cut',
  /** 剪贴板清空 */
  CLIPBOARD_CLEAR = 'clipboard:clear',

  // ==================== 状态管理事件 ====================
  /** 编辑器状态改变 */
  STATE_CHANGED = 'state:changed',
  /** 状态保存 */
  STATE_SAVED = 'state:saved',
  /** 状态恢复 */
  STATE_RESTORED = 'state:restored',

  // ==================== 错误事件 ====================
  /** 编辑器错误 */
  EDITOR_ERROR = 'editor:error',
  /** 操作错误 */
  OPERATION_ERROR = 'operation:error',
  /** 资源加载错误 */
  RESOURCE_LOAD_ERROR = 'resource:load-error',
  /** 插件加载错误 */
  PLUGIN_LOAD_ERROR = 'plugin:load-error',

  // ==================== 性能事件 ====================
  /** 性能警告 */
  PERFORMANCE_WARNING = 'performance:warning',
  /** 内存使用警告 */
  MEMORY_WARNING = 'memory:warning',
  /** 渲染性能数据 */
  RENDER_PERFORMANCE = 'render:performance',

  // ==================== 导出事件 ====================
  /** 导出开始 */
  EXPORT_START = 'export:start',
  /** 导出完成 */
  EXPORT_COMPLETE = 'export:complete',
  /** 导出错误 */
  EXPORT_ERROR = 'export:error',
  /** 导出进度更新 */
  EXPORT_PROGRESS = 'export:progress',

  // ==================== 导入事件 ====================
  /** 导入开始 */
  IMPORT_START = 'import:start',
  /** 导入完成 */
  IMPORT_COMPLETE = 'import:complete',
  /** 导入错误 */
  IMPORT_ERROR = 'import:error',
  /** 导入进度更新 */
  IMPORT_PROGRESS = 'import:progress',

  // ==================== 协作事件 ====================
  /** 协作连接建立 */
  COLLAB_CONNECTED = 'collab:connected',
  /** 协作连接断开 */
  COLLAB_DISCONNECTED = 'collab:disconnected',
  /** 协作数据接收 */
  COLLAB_DATA_RECEIVED = 'collab:data-received',
  /** 协作操作同步 */
  COLLAB_OPERATION_SYNC = 'collab:operation-sync',

  // ==================== 预览事件 ====================
  /** 预览开始 */
  PREVIEW_START = 'preview:start',
  /** 预览完成 */
  PREVIEW_COMPLETE = 'preview:complete',
  /** 预览错误 */
  PREVIEW_ERROR = 'preview:error',

  // ==================== 自定义事件 ====================
  /** 自定义事件前缀（供插件使用） */
  CUSTOM_PREFIX = 'custom:',
}

/**
 * 事件数据接口定义
 */

// 基础事件数据
export interface BaseEventData {
  timestamp: number
  source?: string
}

// 元素相关事件数据
export interface ElementEventData extends BaseEventData {
  element: any
  elementId: string
}

export interface SelectionEventData extends BaseEventData {
  selectedIds: string[]
  previousSelectedIds: string[]
}

export interface TransformEventData extends ElementEventData {
  oldState: any
  newState: any
  transformType: 'move' | 'rotate' | 'scale' | 'skew'
}

// 工具事件数据
export interface ToolEventData extends BaseEventData {
  toolName: string
  previousTool?: string
}

// 插件事件数据
export interface PluginEventData extends BaseEventData {
  pluginName: string
  pluginVersion?: string
}

// 命令事件数据
export interface CommandEventData extends BaseEventData {
  commandName: string
  command: any
}

// 历史事件数据
export interface HistoryEventData extends BaseEventData {
  canUndo: boolean
  canRedo: boolean
  undoDescription?: string
  redoDescription?: string
}

// 视图事件数据
export interface ViewEventData extends BaseEventData {
  zoom: number
  previousZoom?: number
  viewport?: any
}

// 创建事件数据
export interface CreationEventData extends BaseEventData {
  element: any
  toolName: string
  startPoint: any
  endPoint?: any
}

// 错误事件数据
export interface ErrorEventData extends BaseEventData {
  error: Error
  operation?: string
  context?: any
}

// 性能事件数据
export interface PerformanceEventData extends BaseEventData {
  metric: string
  value: number
  threshold?: number
}

/**
 * 事件工具函数
 */

export class EventUtils {
  /**
   * 生成自定义事件名（供插件使用）
   */
  static createCustomEvent(pluginName: string, eventName: string): string {
    return `${EditorEvents.CUSTOM_PREFIX}${pluginName}:${eventName}`
  }

  /**
   * 检查是否为自定义事件
   */
  static isCustomEvent(eventName: string): boolean {
    return eventName.startsWith(EditorEvents.CUSTOM_PREFIX)
  }

  /**
   * 从自定义事件名解析插件名和事件名
   */
  static parseCustomEvent(eventName: string): { pluginName: string; eventName: string } | null {
    if (!this.isCustomEvent(eventName)) return null
    const parts = eventName.replace(EditorEvents.CUSTOM_PREFIX, '').split(':')
    if (parts.length < 2) return null
    return {
      pluginName: parts[0],
      eventName: parts.slice(1).join(':'),
    }
  }

  /**
   * 创建基础事件数据
   */

  static createBaseEventData(source?: string): BaseEventData {
    return {
      timestamp: Date.now(),
      source: source || 'editor',
    }
  }
}
