<template>
  <Vkedit :host="host"></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  createEditorHost,
  RectPlugin,
  TextPlugin,
  TablePlugin,
  Vkedit,
  EditorEvents,
  BaseElementPropertyPanel,
  CanvasPropertyPanel,
} from 'vkedit'

const host = createEditorHost()
host
  .installPlugin(new RectPlugin())
  .installPlugin(new TextPlugin())
  .installPlugin(new TablePlugin())

onMounted(() => {
  host.emit(EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED, BaseElementPropertyPanel)
  host.emit(EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED, CanvasPropertyPanel)
})
</script>

<style scoped></style>
