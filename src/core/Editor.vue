<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="h-16 w-full border-b border-gray-300 px-4 bg-white">
      <Toolbar :host="host">
        <template #left>
          <slot name="toolbar-left"></slot>
        </template>
        <template #center>
          <slot name="toolbar-center"></slot>
        </template>
        <template #right>
          <slot name="toolbar-right"></slot>
        </template>
      </Toolbar>
    </div>

    <!-- 中间主区域 -->
    <div class="flex flex-1 min-h-0">
      <!-- 左侧菜单栏 -->
      <div class="w-[200px] border-r border-gray-200 bg-gray-50">
        <div class="text-center py-2 border-b border-gray-200">添加图形</div>
        <Toolbox :host="host" />
      </div>

      <!-- 中间内容区（可滚动） -->
      <div class="flex-1 overflow-auto bg-gray-100 flex justify-center">
        <CanvasView :host="host" />
      </div>

      <!-- 右侧属性栏 -->
      <div class="w-[460px] border-l border-gray-200 p-4 bg-white">
        <PropertyPanel :host="host" />
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="h-10 border-t border-gray-300 flex items-center px-4 bg-white">
      <Bottom :host="host" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from './Toolbar.vue' // 顶部区域
import Bottom from './Bottom.vue' // 底部区域
import Toolbox from './Toolbox.vue'
import CanvasView from './CanvasView.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { IEditorHost } from '../types'

const { host } = defineProps<{ host: IEditorHost }>()
</script>

<style scoped></style>
