<template>
  <div class="app-root">
    <nav class="app-nav">
      <button
        :class="['app-nav__tab', { 'app-nav__tab--active': activeView === 'editor' }]"
        @click="activeView = 'editor'"
      >
        编辑器视图
      </button>
      <button
        :class="['app-nav__tab', { 'app-nav__tab--active': activeView === 'showcase' }]"
        @click="activeView = 'showcase'"
      >
        组件展示
      </button>
      <button v-if="activeView === 'editor'" class="app-nav__test-btn" @click="redraw">
        测试舞台重绘
      </button>
    </nav>

    <Vkedit
      v-if="activeView === 'editor'"
      :host="host"
      :show-toolbox="true"
      :show-property-panel="true"
      :show-toolbar="true"
    />
    <Showcase v-if="activeView === 'showcase'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  createEditorHost,
  RectPlugin,
  TextPlugin,
  TablePlugin,
  QrcodePlugin,
  BarcodePlugin,
  ChartPlugin,
  Vkedit,
} from '@/index'
import { LinePlugin } from '@/plugins/line'
import Showcase from './Showcase.vue'

const activeView = ref<'editor' | 'showcase'>('editor')

const host = createEditorHost({ basePropertyPanel: false, baseCanvasPropertyPanel: true })
host
  .installPlugin('rect-plugin', RectPlugin)
  .installPlugin('text-plugin', TextPlugin)
  .installPlugin('table-plugin', TablePlugin)
  .installPlugin('qr-plugin', QrcodePlugin)
  .installPlugin('barcode-plugin', BarcodePlugin)
  .installPlugin('chart-plugin', ChartPlugin)
  .installPlugin('line-plugin', LinePlugin)
function redraw() {
  host.emit('stage:redraw', {})
}

onMounted(() => {})
</script>

<style scoped>
.app-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 0 12px;
  flex-shrink: 0;
}

.app-nav__tab {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.app-nav__tab:hover {
  color: #333;
}

.app-nav__tab--active {
  color: #111;
  border-bottom-color: #111;
}

.app-nav__test-btn {
  margin-left: auto;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
}

.app-nav__test-btn:hover {
  background: #f0f0f0;
}
</style>
