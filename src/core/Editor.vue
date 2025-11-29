<template>
  <div class="h-screen flex flex-col overflow-hidden bg-card">
    <!-- 顶部工具栏 -->
    <header v-if="showToolbar" class="h-16 w-full border-b border-border">
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
    <main class="flex flex-auto min-h-0 w-full">
      <!-- 左侧菜单栏 -->
      <div
        v-if="showToolbox"
        class="basis-2/12 min-w-40 flex-none border-r border-border overflow-auto"
      >
        <div class="text-center py-2 border-b border-border">添加图形</div>
        <Toolbox :host="host">
          <template #toolbox>
            <slot name="toolbox" :host="host"></slot>
          </template>
        </Toolbox>
      </div>

      <!-- 中间内容区（可滚动） -->
      <div class="basis-7/12 flex-auto flex relative overflow-hidden">
        <StageView :host="host" :key="stageKey" />
      </div>

      <!-- 右侧属性栏 -->
      <div
        v-if="showPropertyPanel"
        class="basis-3/12 min-w-44 flex-none border-l border-border p-4 bg-card overflow-auto"
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
