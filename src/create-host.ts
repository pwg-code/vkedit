import { EditorHost } from './core/editor-host'
import {
  AlignPlugin,
  ClipboardPlugin,
  ElementManagerPlugin,
  ExportPlugin,
  KeyDownPlugin,
  PropertyPanelManagerPlugin,
  SelectionPlugin,
  ToolbarManagerPlugin,
  PreviewPlugin,
  GraphicToolManagerPlugin,
  GraphicManagerPlugin,
  ImportPlugin,
  ContextMenuManagerPlugin,
} from './plugins'
import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'
import ContextMenuDelete from '@/components/ContextMenuDelete.vue'

export interface IOptions {
  basePropertyPanel?: boolean
  baseCanvasPropertyPanel?: boolean
  exportPlugin?: boolean
  previewPlugin?: boolean
  importPlugin?: boolean
}

// 创建安装了核心插件的宿主
export function createEditorHost({
  basePropertyPanel = false,
  baseCanvasPropertyPanel = true,
  exportPlugin = true,
  previewPlugin = true,
  importPlugin = true,
}: IOptions) {
  const host = new EditorHost()
  host
    .installPlugin('toolbar-manager-plugin', ToolbarManagerPlugin)
    .installPlugin('graphic-tool-manager-plugin', GraphicToolManagerPlugin)
    .installPlugin('graphic-manager-plugin', GraphicManagerPlugin)
    .installPlugin('property-panel-manager-plugin', PropertyPanelManagerPlugin)
    .installPlugin('element-manager-plugin', ElementManagerPlugin)
    .installPlugin('keydown-plugin', KeyDownPlugin)
    .installPlugin('selection-plugin', SelectionPlugin)
    .installPlugin('clipboard-plugin', ClipboardPlugin)
    .installPlugin('align-plugin', AlignPlugin)
    .installPlugin('context-menu-manager-plugin', ContextMenuManagerPlugin)

  if (basePropertyPanel) {
    host.emit('property-panel:registered', {
      render: () => BaseElementPropertyPanel,
      graphicTypes: [],
      isPublic: true,
      isCanvas: false,
      timestamp: Date.now(),
      source: 'createEditorHost',
    })
  }

  if (baseCanvasPropertyPanel) {
    host.emit('property-panel:registered', {
      render: () => CanvasPropertyPanel,
      graphicTypes: [],
      isPublic: false,
      isCanvas: true,
      timestamp: Date.now(),
      source: 'createEditorHost',
    })
  }

  if (importPlugin) {
  host.installPlugin('import-plugin', ImportPlugin)
  }
  if (exportPlugin) {
  host.installPlugin('export-plugin', ExportPlugin)
  }
  if (previewPlugin) {
  host.installPlugin('preview-plugin', PreviewPlugin)
  }

  // // 注册删除元素上下文菜单
  // host.emit('context-menu:registered', {
  //   graphicTypes: [],
  //   isPublic: true,
  //   isCanvas: false,
  //   render: () => ContextMenuDelete,
  //   timestamp: Date.now(),
  //   source: 'create-editor-host',
  // })
  return host
}
