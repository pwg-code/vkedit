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
  ContextMenuManager
} from './plugins'
import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'
import ContextMenuDelete from "@/components/ContextMenuDelete.vue";

export interface IOptions {
  basePropertyPanel?: boolean
  baseCanvasPropertyPanel?: boolean
  exportPlugin?: boolean
  previewPlugin?: boolean
}

// 创建安装了核心插件的宿主
export function createEditorHost({
  basePropertyPanel = true,
  baseCanvasPropertyPanel = true,
  exportPlugin = true,
  previewPlugin = true,
}: IOptions) {
  const host = new EditorHost()
  host
    .installPlugin(new ToolbarManagerPlugin())
    .installPlugin(new GraphicToolManagerPlugin())
    .installPlugin(new GraphicManagerPlugin())
    .installPlugin(new PropertyPanelManagerPlugin())
    .installPlugin(new ElementManagerPlugin())
    .installPlugin(new KeyDownPlugin())
    .installPlugin(new SelectionPlugin())
    .installPlugin(new AlignPlugin())
    .installPlugin(new ContextMenuManager())

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

  if (exportPlugin) {
    host.installPlugin(new ExportPlugin())
  }
  if (previewPlugin) {
    host.installPlugin(new PreviewPlugin())
  }

  // 注册删除元素上下文菜单
  host.emit('context-menu:registered', {
    graphicTypes: [],
    isPublic: true,
    isCanvas: false,
    render:()=> ContextMenuDelete,
    timestamp: Date.now(),
    source: 'create-editor-host',
  })
  return host
}
