<template>
  <div class="h-screen flex flex-col p-4">
    <Toolbar :host="host" />
    <!-- 2. 自动撑满剩余区域 -->
    <main class="flex-1 overflow-auto flex">
      <div class="flex-1 border-[0.5px] border-gray-200">
        <div class="text-center pt-2 pb-2 border-b-[0.5px] border-gray-200">添加图形</div>
        <Toolbox :host="host" />
      </div>
      <div class="flex-6 bg-gray-200 dark:bg-gray-600 flex justify-center">
        <!-- 画布 -->
        <CanvasView :host="host"></CanvasView>
      </div>
      <!-- 右侧属性设置 -->
      <div class="flex-2 border-[0.5px] border-gray-200 p-5">
        <PropertyPanel :host="host"></PropertyPanel>
      </div>
    </main>
    <!-- 3. 固定高度底部 -->
    <Bottom :host="host"></Bottom>
  </div>
</template>

<script setup lang="ts">
import Toolbar from './Toolbar.vue' // 顶部区域
import Bottom from './Bottom.vue' // 底部区域
import Toolbox from './Toolbox.vue'
import CanvasView from './CanvasView.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { IEditorHost } from '../types'
import '../styles/tailwind.css'
import 'element-plus/dist/index.css'

const { host } = defineProps<{ host: IEditorHost }>()
</script>

<style scoped></style>
