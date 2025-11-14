<template>
  <Vkedit
    :host="host"
    :show-toolbox="true"
    :show-property-panel="true"
    :show-toolbar="true"
  ></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  createEditorHost,
  RectPlugin,
  TextPlugin,
  TablePlugin,
  Vkedit,
  BaseElementPropertyPanel,
  CanvasPropertyPanel,
  ElementManagerPlugin,
  TextElement,
  WorksheetElement,
  WorksheetPlugin,
} from '@/index'
// import '@/styles/tailwind-base.css' // 手动导入样式

// import {
//   createEditorHost,
//   RectPlugin,
//   TextPlugin,
//   TablePlugin,
//   Vkedit,
//   BaseElementPropertyPanel,
//   CanvasPropertyPanel,
// } from 'vkedit'

const host = createEditorHost({ basePropertyPanel: false, baseCanvasPropertyPanel: true })
host
  .installPlugin('rect-plugin', new RectPlugin())
  .installPlugin('text-plugin', new TextPlugin())
  .installPlugin('table-plugin', new TablePlugin())
  .installPlugin('worksheet-plugin', new WorksheetPlugin())

function test() {
  host.setState({
    dpm: 8,
    width: 210 * 8,
    height: 297 * 8,
    zoom: 0.4,
  })
  const hostState = host.getState()
  const newTable = new WorksheetElement(0, 0, Array(45).fill(20), Array(20).fill(80))
  host.getPlugin('element-manager-plugin')?.addElement(newTable)
}

onMounted(() => {
  // test()
})
</script>

<style scoped></style>
