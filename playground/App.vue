<template>
  <Vkedit
    :host="host"
    :show-toolbox="true"
    :show-property-panel="true"
    :show-toolbar="true"
  ></Vkedit>
  <button @click="redraw">测试舞台重绘</button>
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
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('table-plugin', TablePlugin)
function test() {
  host.setStatus({
    dpm: 8,
    width: 210 * 8,
    height: 297 * 8,
    zoom: 0.4,
  })
}

// 测试舞台重绘
function redraw() {
  host.emit('stage:redraw', {})
}

onMounted(() => {
  // test()
})
</script>

<style scoped></style>
