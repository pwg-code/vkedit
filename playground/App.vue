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
  TableElement,
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

const host = createEditorHost({ basePropertyPanel: true, baseCanvasPropertyPanel: true })
host
  .installPlugin(new RectPlugin())
  .installPlugin(new TextPlugin())
  .installPlugin(new TablePlugin())

function test() {
  host.setState({
    dpm: 8,
    width: 210 * 8,
    height: 297 * 8,
    zoom: 0.4,
  })
  const hostState = host.getState()
  const newTable = new TableElement(0, 0, Array(45).fill(20), Array(20).fill(80))
  host.getPlugin<ElementManagerPlugin>('element-manager-plugin')?.addElement(newTable)
}

onMounted(() => {
  // test()
})
</script>

<style scoped></style>
