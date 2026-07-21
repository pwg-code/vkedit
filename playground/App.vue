<template>
  <div class="app-root">
    <Vkedit :host="host" :show-toolbox="true" :show-property-panel="true" :show-toolbar="true">
      <template #toolbar-actions="{ host: h }">
        <CanvasPresetSwitcher :host="h" />
        <TemplateSwitcher :host="h" />
      </template>
    </Vkedit>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  createEditorHost,
  RectPlugin,
  TextPlugin,
  QrcodePlugin,
  BarcodePlugin,
  Vkedit,
} from '@/index'
import { LinePlugin } from '@/plugins/line'
import CanvasPresetSwitcher from './components/CanvasPresetSwitcher.vue'
import TemplateSwitcher from './components/TemplateSwitcher.vue'

const host = createEditorHost({ basePropertyPanel: false, baseCanvasPropertyPanel: true })
host
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('qr-plugin', QrcodePlugin)
  .installPlugin('barcode-plugin', BarcodePlugin)
  .installPlugin('line-plugin', LinePlugin)

onMounted(() => {
  host.on('stage:dblclick', (event) => {
    console.group('🔥 stage:dblclick')
    console.log('坐标:', event.point)
    console.log('元素ID:', event.elementId)
    console.log('元素:', event.element)
    console.log('时间戳:', event.timestamp)
    console.groupEnd()
  })
})
</script>

<style>
body {
  margin: 0;
}
</style>

<style scoped>
.app-root {
  height: 100vh;
  overflow: hidden;
}
</style>
