<template>
  <div class="vkedit-status-bar">
    <div class="vkedit-status-bar__section">
      <div class="vkedit-status-bar__zoom-controls">
        <button class="vkedit-status-bar__btn" @click="handleZoomOut()" title="缩小">
          <Icon icon="material-symbols-light:zoom-out" :width="22"></Icon>
        </button>
        <div class="vkedit-status-bar__zoom-value">{{ zoomPercent }}%</div>
        <button class="vkedit-status-bar__btn" @click="handleZoomIn()" title="放大">
          <Icon icon="material-symbols-light:zoom-in-rounded" :width="22"></Icon>
        </button>
        <button class="vkedit-status-bar__btn" @click="handleZoomAuto()" title="自适应">
          <Icon icon="material-symbols-light:zoom-out-map" :width="22"></Icon>
        </button>
      </div>
    </div>

    <div class="vkedit-status-bar__section">
      <span class="vkedit-status-bar__coords">{{ coordsDisplay }}</span>
    </div>

    <div class="vkedit-status-bar__section">
      <div class="vkedit-status-bar__cursor-icon">
        <Icon :icon="cursorIcon" :width="18"></Icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { EditorHost } from '@/core'
import type { CursorMode } from '@/types'
import { useZoom, useHostState, useStage } from '@/hooks'

const { host } = defineProps<{ host: EditorHost }>()

const { hostState } = useHostState(host)
const { zoom, handleZoomIn, handleZoomOut, handleZoomAuto, contentX, contentY } = useZoom(host)
const { currentCursorMode, mouseStageX, mouseStageY } = useStage()

const isMouseInCanvas = ref(true)

const zoomPercent = computed(() => Math.round(zoom.value * 100))

const coordsDisplay = computed(() => {
  if (!isMouseInCanvas.value) return '--,--'
  const dpm = hostState.dpm || 8
  const xmm = (mouseStageX.value - contentX.value) / zoom.value / dpm
  const ymm = (mouseStageY.value - contentY.value) / zoom.value / dpm
  return `X: ${xmm.toFixed(2)}mm  Y: ${ymm.toFixed(2)}mm`
})

const cursorIconMap: Record<CursorMode, string> = {
  'default': 'material-symbols-light:arrow-selector-tool',
  'hovering': 'material-symbols-light:touchpad-mouse',
  'grab': 'material-symbols-light:pan-tool',
  'grabbing': 'material-symbols-light:pan-tool',
  'dragging': 'material-symbols-light:drag-pan',
}

const cursorIcon = computed(() => cursorIconMap[currentCursorMode.value])

onMounted(() => {
  host.on('stage:mouseleave', handleMouseLeave)
  host.on('stage:mouseenter', handleMouseEnter)
})

onUnmounted(() => {
  host.off('stage:mouseleave', handleMouseLeave)
  host.off('stage:mouseenter', handleMouseEnter)
})

const handleMouseLeave = () => {
  isMouseInCanvas.value = false
}

const handleMouseEnter = () => {
  isMouseInCanvas.value = true
}
</script>

<style scoped></style>
