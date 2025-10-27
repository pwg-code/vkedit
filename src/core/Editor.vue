<template>
  <div class="h-screen flex flex-col overflow-hidden bg-card">
    <!-- 顶部工具栏 -->
    <header class="h-16 w-full border-b border-border">
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
    <main class="flex flex-row flex-1 min-h-0 w-full">
      <!-- 左侧菜单栏 -->
      <div class="flex-1 border-r border-border">
        <div class="text-center py-2 border-b border-border">添加图形</div>
        <Toolbox :host="host">
          <template #toolbox>
            <slot name="toolbox" :host="host"></slot>
          </template>
        </Toolbox>
      </div>

      <!-- 中间内容区（可滚动） -->
      <div class="flex-6 flex">
        <CanvasView :host="host" />
      </div>

      <!-- 右侧属性栏 -->
      <div class="flex-2 border-l border-border p-4 bg-card">
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
import CanvasView from './CanvasView.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { IEditorHost } from '../types'

const { host } = defineProps<{ host: IEditorHost }>()
</script>

<style scoped></style>
