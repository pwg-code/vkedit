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
  EditorEvents,
  BaseElementPropertyPanel,
  CanvasPropertyPanel,
  ElementsPlugin,
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
//   EditorEvents,
//   BaseElementPropertyPanel,
//   CanvasPropertyPanel,
// } from 'vkedit'

const host = createEditorHost({})
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
  host.getPlugin<ElementsPlugin>('elements')?.addElement(newTable)

  // 随机添加文本
  // for (let i=0;i<5000;i++){
  //   const x = Math.random() * hostState.width
  //   const y = Math.random() * hostState.height
  //   const newText =  new TextElement(x,y)
  //   host.getPlugin<ElementsPlugin>('elements')?.addElement(newText)
  // }
}

onMounted(() => {
  // host.emit(EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED, BaseElementPropertyPanel)
  // host.emit(EditorEvents.PROPERTY_PANEL_CANVAS_REGISTERED, CanvasPropertyPanel)
  // test()
})
</script>

<style scoped></style>
