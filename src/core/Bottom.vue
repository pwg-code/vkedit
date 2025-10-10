<template>
  <div class="w-full h-12 flex items-center justify-end gap-6 p-2">
    <div class="flex-4"></div>
    <!-- 缩放控制 -->
    <!-- <div class="flex gap-2 flex-2">
      <div class="min-w-[60px] text-sm">缩放:</div>
      <ElSlider v-model="hostState.zoom" size="small" :step="0.1" :min="0.6" :max="2.0"></ElSlider>
      <ElButton @click="handleZoomReset" title="重置缩放">1:1</ElButton>
    </div> -->

    <!-- 状态显示 -->
    <div class="text-sm flex gap-2 flex-2">
      <span class="status-item">工具: {{ currentToolTitle }}</span>
      <span class="status-item" v-if="hasSelection">
        选中: {{ hostState.selectedElementIds.length }} 个元素
      </span>
      <span class="status-item">坐标: ({{ cursorPosition.x }}, {{ cursorPosition.y }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { IEditorHost, IEditorState } from '../types'
import { ElButton, ElSlider } from 'element-plus'

const { host } = defineProps<{ host: IEditorHost }>()

const hostState = ref<IEditorState>(host.getState())

// 光标位置
const cursorPosition = ref({ x: 0, y: 0 })

const currentToolTitle = computed(() => {
  return hostState.value.currentTool
})

const hasSelection = computed(() => {
  return hostState.value.selectedElementIds.length > 0
})

const handleZoomIn = () => {
  const newZoom = Math.min(hostState.value.zoom * 1.2, 5)
  host.setState({ zoom: newZoom })
}

const handleZoomOut = () => {
  const newZoom = Math.max(hostState.value.zoom / 1.2, 0.1)
  host.setState({ zoom: newZoom })
}

const handleZoomReset = () => {
  host.setState({ zoom: 1 })
}

const handleZoomToFit = () => {
  host.emit('view:zoomToFit')
}

const handleCursorMove = (point: { x: number; y: number }) => {
  cursorPosition.value = {
    x: Math.round(point.x),
    y: Math.round(point.y),
  }
}

// 生命周期
onMounted(() => {
  // 监听光标移动
  host.on('canvas:mousemove', handleCursorMove)
})

onUnmounted(() => {
  host.off('canvas:mousemove', handleCursorMove)
})
</script>

<style scoped></style>
