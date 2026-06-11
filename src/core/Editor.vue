<template>
  <div class="vkedit-editor">
    <!-- 顶部工具栏 -->
    <header v-if="showToolbar" class="vkedit-toolbar">
      <Toolbar :host="host">
        <template #left>
          <slot name="toolbar-left" :host="host"></slot>
        </template>
        <template #center>
          <slot name="toolbar-center" :host="host"></slot>
        </template>
        <template #right>
          <slot name="toolbar-right" :host="host"></slot>
        </template>
      </Toolbar>
    </header>

    <!-- 中间主区域 -->
    <main class="vkedit-editor__main">
      <!-- 左侧菜单栏 -->
      <div
        v-if="showToolbox"
        class="vkedit-toolbox"
      >
        <div class="vkedit-toolbox__title">添加图形</div>
        <Toolbox :host="host">
          <template #toolbox>
            <slot name="toolbox" :host="host"></slot>
          </template>
        </Toolbox>
      </div>

      <!-- 中间内容区（可滚动） -->
      <div class="vkedit-stage-view">
        <StageView :host="host" :key="stageKey" />
      </div>

      <!-- 右侧属性栏 -->
      <div
        v-if="showPropertyPanel"
        class="vkedit-property-panel"
      >
        <PropertyPanel :host="host">
          <template #property-panel>
            <slot name="property-panel" :host="host"></slot>
          </template>
        </PropertyPanel>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Toolbar from './Toolbar.vue' // 顶部区域
import Toolbox from './Toolbox.vue'
import StageView from './StageView.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { EditorHost } from '@/core'
import { onMounted, ref } from 'vue'

const {
  host,
  showToolbox = true,
  showPropertyPanel = true,
  showToolbar = true,
} = defineProps<{
  host: EditorHost
  showToolbox?: boolean
  showPropertyPanel?: boolean
  showToolbar?: boolean
}>()

const stageKey = ref(`stage-${Date.now()}`)

// 绑定舞台重绘事件
onMounted(() => {
  host.on('stage:redraw', () => {
    // 强制更改key 以触发StageView重绘
    stageKey.value = `stage-${Date.now()}`
  })
})
</script>

<style scoped></style>
