<template>
  <Vkedit :host="host"></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { EditorHost } from '../src'
import type { IEditorHost, IPropertyPanel } from '@/types'
import { Vkedit } from '@/index'
import {
  RectPlugin,
  TextPlugin,
  TablePlugin,
  SelectionPlugin,
  KeyDownPlugin,
  ElementsPlugin,
  GraphicTypesPlugin,
  PropertyPanelsPlugin,
  ToolbarPlugin,
} from '@/plugins'
import { EditorEvents } from '@/types/EventTypes'
import CanvasPropertyPanel from '@/components/CanvasPropertyPanel.vue'
import { AlignPlugin } from '@/plugins/align/AlignPlugin'

// const host = ref<IEditorHost>(new EditorHost())
const host = new EditorHost()

host.registerPlugin(new ToolbarPlugin())
host.registerPlugin(new GraphicTypesPlugin())
host.registerPlugin(new PropertyPanelsPlugin())
host.registerPlugin(new ElementsPlugin())
host.registerPlugin(new SelectionPlugin())
host.registerPlugin(new KeyDownPlugin())

host.registerPlugin(new RectPlugin())
host.registerPlugin(new TextPlugin())
host.registerPlugin(new TablePlugin())

host.registerPlugin(new AlignPlugin())
// 可以动态注册属性面板
const canvasPanel: IPropertyPanel = {
  type: '',
  title: '画布属性',
  getComponent() {
    return CanvasPropertyPanel
  },
}
// 注册不同类型的模版
// host.emit(EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED, canvasPanel)

// host.emit(EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED, canvasPanel)
host.emit(EditorEvents.PROPERTY_PANEL_FOR_GRAPHICS_REGISTERED, {
  ...canvasPanel,
  forGraphics: ['text', 'table'],
})

onMounted(() => {})
</script>

<style scoped></style>
