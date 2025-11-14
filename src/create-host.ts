import { EditorHost } from './core/editor-host'
import {
  AlignPlugin,
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
    .installPlugin('toolbar-manager-plugin', new ToolbarManagerPlugin())
    .installPlugin('graphic-tool-manager-plugin', new GraphicToolManagerPlugin())
    .installPlugin('graphic-manager-plugin', new GraphicManagerPlugin())
    .installPlugin('property-panel-manager-plugin', new PropertyPanelManagerPlugin())
    .installPlugin('element-manager-plugin', new ElementManagerPlugin())
    .installPlugin('keydown-plugin', new KeyDownPlugin())
    .installPlugin('selection-plugin', new SelectionPlugin())
    .installPlugin('align-plugin', new AlignPlugin())
    .installPlugin('context-menu-manager-plugin', new ContextMenuManagerPlugin())

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
    host.installPlugin('import-plugin', new ImportPlugin())
  }
  if (exportPlugin) {
    host.installPlugin('export-plugin', new ExportPlugin())
  }
  if (previewPlugin) {
    host.installPlugin('preview-plugin', new PreviewPlugin())
  }

  // 注册删除元素上下文菜单
  host.emit('context-menu:registered', {
    graphicTypes: [],
    isPublic: true,
    isCanvas: false,
    render: () => ContextMenuDelete,
    timestamp: Date.now(),
    source: 'create-editor-host',
  })
  return host
}
