<template>
  <div class="w-full h-12 flex items-center justify-end gap-6 p-2">
    <div class="flex-4"></div>
    <!-- 状态显示 -->
    <div class="text-sm flex gap-4 flex-2 items-center">
      <span class="status-item">工具: {{ currentToolTitle }}</span>
      <span class="status-item" v-if="selectionCount"> 选中: {{ selectionCount }} 个元素 </span>
      <div class="pl-3 flex items-center">
        <div class="w-[40px]">缩放</div>
        <div class="w-[200px]">
          <Slider
            :max="3"
            :min="0.2"
            size="small"
            :model-value="[hostState.zoom]"
            :step="0.1"
            @update:model-value="
              (value) => {
                if (value) {
                  hostState.zoom = value[0]
                }
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { IEditorHost, IEditorState } from '../types'
import type { SelectionPlugin } from '@/plugins'
import { Slider } from '@/components/ui/slider'

const { host } = defineProps<{ host: IEditorHost }>()

const hostState = ref<IEditorState>(host.getState())

// 光标位置
const cursorPosition = ref({ x: 0, y: 0 })

const currentToolTitle = computed(() => {
  return hostState.value.currentTool
})

const selectionCount = computed(() => {
  const selector = host.getPlugin<SelectionPlugin>('selection')
  return selector?.selectionElements.size
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
