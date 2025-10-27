import type { App } from 'vue'
import Vkedit from './core/Editor.vue'
import { EditorHost } from './core/EditorHost'
import '@/styles/index.css'

import {
  SelectionPlugin,
  KeyDownPlugin,
  ElementsPlugin,
  GraphicTypesPlugin,
  PropertyPanelsPlugin,
  ToolbarPlugin,
  AlignPlugin,
} from './plugins'

export type {
  IEditorHost,
  IEditorPlugin,
  IEditorState,
  IGraphicType,
  IGraphicElement,
} from './types'

export { BaseGraphicElement, BaseGraphicType, BasePlugin, EditorEvents } from './types'
import { EditorEvents } from './types'

export { TextPlugin, TextElement } from './plugins/text/TextPlugin'
export { RectPlugin, RectElement } from './plugins/rect/RectPlugin'
export { TablePlugin, TableElement } from './plugins/table/TablePlugin'

import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'
// 导出UI
import {
  VkButton,
  VkButtonGroup,
  VkInput,
  VkLabel,
  VkNumberField,
  VkNumberFieldContent,
  VkNumberFieldDecrement,
  VkNumberFieldIncrement,
  VkNumberFieldInput,
  VkSeparator,
  VkSlider,
  VkSwitch,
} from '@/components/ui'

export function install(app: App) {
  app.component('Vkedit', Vkedit)
}

interface IOptions {
  basePropertyPanel?: boolean
  baseCanvasPropertyPanel?: boolean
}

// 创建安装了核心插件的宿主
export function createEditorHost({
  basePropertyPanel = true,
  baseCanvasPropertyPanel = true,
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

  return host
}

export {
  Vkedit,
  EditorHost,
  CanvasPropertyPanel,
  BaseElementPropertyPanel,
  SelectionPlugin,
  KeyDownPlugin,
  ElementsPlugin,
  GraphicTypesPlugin,
  PropertyPanelsPlugin,
  ToolbarPlugin,
  AlignPlugin,
  VkButton,
  VkButtonGroup,
  VkInput,
  VkLabel,
  VkNumberField,
  VkNumberFieldContent,
  VkNumberFieldDecrement,
  VkNumberFieldIncrement,
  VkNumberFieldInput,
  VkSeparator,
  VkSlider,
  VkSwitch,
}
