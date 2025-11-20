import type { Component } from 'vue'
import type { IEditorState, IGraphicElement, IGraphicType, Point2D } from './base'

/**
 * 事件数据接口定义
 */

// 基础事件数据
export interface BaseEventData {
  timestamp: number
  source: string
}

// 元素相关事件数据
export interface ElementEventData extends BaseEventData {
  element: any
  elementId: string
}

// 元素注册事件数据
export interface ElementRegisteredEventData extends BaseEventData {
  createElement: () => IGraphicElement
  type: string
}

export interface SelectionEventData extends BaseEventData {
  selection: Array<IGraphicElement>
}

export interface TransformEventData extends ElementEventData {
  oldState: any
  newState: any
  transformType: 'move' | 'rotate' | 'scale' | 'skew' | 'resize' | 'transform'
}

/* 元素更新 */
export interface ElementUpdateEventData extends ElementEventData {
  updatedProperties: string[]
}

// 工具事件数据
export interface ToolEventData extends BaseEventData {
  toolName: string
  render: () => Component
}

// 插件事件数据
export interface PluginEventData extends BaseEventData {
  plugin: any
}

// 命令事件数据
export interface CommandEventData extends BaseEventData {
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
  error: any
  operation?: string
  context?: any
}

// 性能事件数据
export interface PerformanceEventData extends BaseEventData {
  metric: string
  value: number
  threshold?: number
}

// 状态事件数据
export interface StateEventData extends BaseEventData {
  state: IEditorState
}

// 对其分布事件数据
export interface AlignEventData extends BaseEventData {
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
  elementIds: string[]
}

// 元素层级调整事件数据
export interface LayerOrderEventData extends BaseEventData {
  elementId: string
  direction: 'up' | 'down' | 'top' | 'bottom'
}

// Stage基础事件数据
export interface BaseStageEventData extends BaseEventData {
  point: Point2D
  target: any
  currentTarget: any
  pointerId: number
  type: string
}

// Stage鼠标事件数据
export interface StageMouseEventData extends BaseStageEventData {
  evt: MouseEvent
}

// Stage按键事件数据
export interface StageKeyboardEventData extends BaseEventData {
  evt: KeyboardEvent
}

// status changed event data
export interface StatusEventData extends BaseEventData {
  status: IEditorState
}



// (plugin-specific event payload types moved to their plugin's types.d.ts files)

/**
 * 事件工具函数
 */
export class EventUtils {
  /**
   * 生成自定义事件名（供插件使用）
   */
  static createCustomEvent(pluginName: string, eventName: string): string {
    return `custom:${pluginName}:${eventName}`
  }

  /**
   * 检查是否为自定义事件
   */
  static isCustomEvent(eventName: string): boolean {
    return eventName.startsWith('custom:')
  }

  /**
   * 从自定义事件名解析插件名和事件名
   */
  static parseCustomEvent(eventName: string): { pluginName: string; eventName: string } | null {
    if (!this.isCustomEvent(eventName)) return null
    const parts = eventName.replace('custom:', '').split(':')
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
