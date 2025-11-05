import { EditorHost } from './core/editor-host'
import {
  AlignPlugin,
  ElementsPlugin,
  ExportPlugin,
  GraphicTypesPlugin,
  KeyDownPlugin,
  PropertyPanelsPlugin,
  SelectionPlugin,
  ToolbarPlugin,
} from './plugins'
import { EditorEvents } from './types'
import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'

export interface IOptions {
  basePropertyPanel?: boolean
  baseCanvasPropertyPanel?: boolean
  exportPlugin?: boolean
}

// 创建安装了核心插件的宿主
export function createEditorHost({
  basePropertyPanel = true,
  baseCanvasPropertyPanel = true,
  exportPlugin = true,
}: IOptions) {
  const host = new EditorHost()
  host
    .installPlugin(new ToolbarPlugin())
    .installPlugin(new PropertyPanelsPlugin())
    .installPlugin(new GraphicTypesPlugin())
    .installPlugin(new ElementsPlugin())
    .installPlugin(new KeyDownPlugin())
    .installPlugin(new SelectionPlugin())
    .installPlugin(new AlignPlugin())

  if (basePropertyPanel) {
    host.emit(EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED, BaseElementPropertyPanel)
  }

  if (baseCanvasPropertyPanel) {
    host.emit(EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED, CanvasPropertyPanel)
  }

  if (exportPlugin) {
    host.installPlugin(new ExportPlugin())
  }

  return host
}
