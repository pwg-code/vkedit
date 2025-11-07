<template>
  <!-- 放大缩小按钮 -->
  <div
    class="flex items-center absolute"
    :style="{
      top: height - 50 + 'px',
      left: width - 200 + 'px',
    }"
  >
    <button class="hover:bg-background rounded-xl active:bg-secondary p-2" @click="handleZoomOut()">
      <Icon icon="material-symbols-light:zoom-out" :width="30"></Icon>
    </button>
    <div class="w-10 flex-1 text-center">{{ zoom.toFixed(2) }}</div>
    <button class="hover:bg-background rounded-xl active:bg-secondary p-2" @click="handleZoomIn()">
      <Icon icon="material-symbols-light:zoom-in-rounded" :width="30"></Icon>
    </button>
    <button
      class="hover:bg-background rounded-xl active:bg-secondary p-2"
      @click="handleZoomAuto()"
    >
      <Icon icon="material-symbols-light:zoom-out-map" :width="30"></Icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useStage, useZoom } from '@/hooks'
import { EditorEvents, type IEditorHost } from '@/types'
import { Icon } from '@iconify/vue'
import { onMounted } from 'vue';

const { host } = defineProps<{ host: IEditorHost }>()

// 画布长宽
const { width, height } = useStage()

// 缩放hook
const { zoom, handleZoomIn, handleZoomOut, handleZoomAuto, handleWheel } = useZoom(host)

onMounted(() => {
  // 监听滚轮事件 实现缩放
  host.on(EditorEvents.CANVAS_WHEEL, handleWheel)
})

</script>

<style scoped></style>
