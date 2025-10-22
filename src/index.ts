import type { App } from 'vue'
import Vkedit from './core/Editor.vue'
import { EditorHost } from './core/EditorHost'
import {
  SelectionPlugin,
  KeyDownPlugin,
  ElementsPlugin,
  GraphicTypesPlugin,
  PropertyPanelsPlugin,
  ToolbarPlugin,
  AlignPlugin,
} from './plugins'

// import './styles/tailwind.css'

export type {
  IEditorHost,
  IEditorPlugin,
  IEditorState,
  IGraphicType,
  IGraphicElement,
} from './types'

export { BaseGraphicElement, BaseGraphicType, BasePlugin, EditorEvents } from './types'

export { TextPlugin } from './plugins/text/TextPlugin'
export { RectPlugin } from './plugins/rect/RectPlugin'
export { TablePlugin } from './plugins/table/TablePlugin'

import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'

export function install(app: App) {
  app.component('Vkedit', Vkedit)
}

// 创建安装了核心插件的宿主
export function createEditorHost() {
  const host = new EditorHost()
  return host
    .installPlugin(new ToolbarPlugin())
    .installPlugin(new PropertyPanelsPlugin())
    .installPlugin(new GraphicTypesPlugin())
    .installPlugin(new ElementsPlugin())
    .installPlugin(new KeyDownPlugin())
    .installPlugin(new SelectionPlugin())
    .installPlugin(new AlignPlugin())
}

export { Vkedit, EditorHost, CanvasPropertyPanel, BaseElementPropertyPanel }
