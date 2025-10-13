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

import './styles/tailwind.css'
import 'element-plus/dist/index.css'

export * from './types'

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

export { Vkedit, EditorHost }
