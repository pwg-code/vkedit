<template>
  <!-- 放大缩小按钮 -->
  <div
    class="flex items-center absolute"
    :style="{
      top: height - 80 + 'px',
      left: width - 220 + 'px',
    }"
  >
    <button class="hover:bg-white rounded-xl active:bg-neutral-100 p-2" @click="handleZoomOut()">
      <Icon icon="material-symbols-light:zoom-out" :width="30"></Icon>
    </button>
    <div class="w-10 flex-1 text-center">{{ zoom.toFixed(2) }}</div>
    <button class="hover:bg-white rounded-xl active:bg-neutral-100 p-2" @click="handleZoomIn()">
      <Icon icon="material-symbols-light:zoom-in-rounded" :width="30"></Icon>
    </button>
    <button
      class="hover:bg-white rounded-xl active:bg-neutral-100 p-2"
      @click="handleZoomAutoWithScroll()"
    >
      <Icon icon="material-symbols-light:zoom-out-map" :width="30"></Icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useScrollbarLayer, useStage, useZoom } from '@/hooks'
import { type EditorHost } from '@/core'
import { Icon } from '@iconify/vue'
import { onMounted } from 'vue'

const { host } = defineProps<{ host: EditorHost }>()

// 画布长宽
const { width, height } = useStage()

// 缩放hook
const { zoom, handleZoomIn, handleZoomOut, handleZoomAuto, handleWheel } = useZoom(host)

const { resetScrollbarPosition } = useScrollbarLayer(host)

// 自适应
const handleZoomAutoWithScroll = () => {
  // 计算合适的缩放比例
  handleZoomAuto()
  // 使滚动条在最佳位置
  resetScrollbarPosition()
}

onMounted(() => {
  // 监听滚轮事件 实现缩放
  host.on('stage:wheel', handleWheel)
})
</script>

<style scoped></style>
