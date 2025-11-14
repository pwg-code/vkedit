import type {
  AlignPlugin,
  ExportPlugin,
  ImportPlugin,
  PreviewPlugin,
  RectPlugin,
  TablePlugin,
  TextPlugin,
  ContextMenuManagerPlugin,
  ElementManagerPlugin,
  GraphicManagerPlugin,
  GraphicToolManagerPlugin,
  KeyDownPlugin,
  PropertyPanelManagerPlugin,
  SelectionPlugin,
  ToolbarManagerPlugin,
  WorksheetPlugin,
} from '@/plugins'

import type { IEditorPlugin } from './base'
import type { get } from 'lodash'

/**
 * 插件映射接口 - 用于获得类型提示
 * 对于自定义插件，需要继承并实现对应的接口，并在实例化host时传入
 */
export interface PluginMap {
  // 生命周期
  'element-manager-plugin': ElementManagerPlugin
  'align-plugin': AlignPlugin
  'context-menu-manager-plugin': ContextMenuManagerPlugin
  'export-plugin': ExportPlugin
  'graphic-manager-plugin': GraphicManagerPlugin
  'graphic-tool-manager-plugin': GraphicToolManagerPlugin
  'import-plugin': ImportPlugin
  'keydown-plugin': KeyDownPlugin
  'preview-plugin': PreviewPlugin
  'property-panel-manager-plugin': PropertyPanelManagerPlugin
  'rect-plugin': RectPlugin
  'selection-plugin': SelectionPlugin
  'table-plugin': TablePlugin
  'text-plugin': TextPlugin
  'toolbar-manager-plugin': ToolbarManagerPlugin
  'worksheet-plugin': WorksheetPlugin
}

class Test<T extends { [K in keyof T]: IEditorPlugin }> {
  // private plugins: Partial<{ [K in keyof T]: IEditorPlugin }> = {}
  private plugins: Map<keyof T, T[keyof T]> = new Map()

  getPlugin<K extends keyof T>(name: K): T[K] {
    return this.plugins.get(name) as T[K]
  }
  installPlugin<K extends keyof T>(name: K, plugin: T[K]): void {
    this.plugins.set(name, plugin)
  }
}
