<template>
  <div class="app-root">
    <Vkedit :host="host" :show-toolbox="true" :show-property-panel="true" :show-toolbar="true">
      <template #toolbar-actions="{ host: h }">
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
import TemplateSwitcher from './components/TemplateSwitcher.vue'
import { templates } from './templates'

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

  loadExampleTemplate()
})

function loadExampleTemplate() {
  const tpl = templates[0]
  if (!tpl) return
  const elementsPlugin = host.getPlugin('graphic-registry-plugin')
  if (!elementsPlugin) return

  function onError() {
    console.warn('示例模板加载失败')
  }

  host.on('host:load-json:error', onError)
  host.loadJSON(JSON.stringify(tpl.data))
  host.off('host:load-json:error', onError)
  host.emit('stage:redraw', {})
}
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
