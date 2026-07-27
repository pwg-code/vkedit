<template>
  <div class="vkedit-status-bar">
    <div class="vkedit-status-bar__section">
      <div class="vkedit-status-bar__zoom-controls">
        <button class="vkedit-status-bar__btn" @click="handleZoomOut()" title="缩小">
          <IconZoomOut :width="22" />
        </button>
        <div class="vkedit-status-bar__zoom-value">{{ zoomPercent }}%</div>
        <button class="vkedit-status-bar__btn" @click="handleZoomIn()" title="放大">
          <IconZoomInRounded :width="22" />
        </button>
        <button class="vkedit-status-bar__btn" @click="handleZoomAuto()" title="自适应">
          <IconZoomOutMap :width="22" />
        </button>
      </div>
    </div>

    <div class="vkedit-status-bar__section">
      <span class="vkedit-status-bar__coords">{{ coordsDisplay }}</span>
    </div>

    <div class="vkedit-status-bar__section">
      <div class="vkedit-status-bar__cursor-icon">
        <component :is="cursorIconMap[currentCursorMode]" :width="18" />
      </div>
    </div>
    <SnapToggle :host="host" collapsed />
    <button
      class="vkedit-status-bar__btn"
      :class="{ 'vkedit-status-bar__btn--active': host.status.snapRotation }"
      title="旋转吸附（5°间隔）"
      @click="host.status.snapRotation = !host.status.snapRotation"
    >
      <IconRotateRight :width="18" :style="{ opacity: host.status.snapRotation ? 1 : 0.4 }" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import IconZoomOut from '~icons/ph/magnifying-glass-minus-light'
import IconZoomInRounded from '~icons/ph/magnifying-glass-plus-light'
import IconZoomOutMap from '~icons/ph/frame-corners-light'
import IconArrowSelectorTool from '~icons/ph/cursor-light'
import IconTouchpadMouse from '~icons/ph/cursor-light'
import IconPanTool from '~icons/ph/hand-light'
import IconDragPan from '~icons/ph/hand-grabbing-light'
import IconRotateRight from '~icons/ph/arrow-clockwise-light'
import SnapToggle from '@/plugins/snap/SnapToggle.vue'
import type { EditorHost } from '@/core'
import type { CursorMode } from '@/types'
import { useZoom, useHostState, useStage } from '@/hooks'

const { host } = defineProps<{ host: EditorHost }>()

const { hostState } = useHostState(host)
const { zoom, handleZoomIn, handleZoomOut, handleZoomAuto, contentX, contentY } = useZoom(host)
const { currentCursorMode, mouseStageX, mouseStageY } = useStage(host)

const isMouseInCanvas = ref(true)

const zoomPercent = computed(() => Math.round(zoom.value * 100))

const coordsDisplay = computed(() => {
  if (!isMouseInCanvas.value) return '--,--'
  const dpm = hostState.dpm || 8
  const xmm = (mouseStageX.value - contentX.value) / zoom.value / dpm
  const ymm = (mouseStageY.value - contentY.value) / zoom.value / dpm
  return `X: ${xmm.toFixed(2)}mm  Y: ${ymm.toFixed(2)}mm`
})

const cursorIconMap: Record<CursorMode, Component> = {
  default: IconArrowSelectorTool,
  hovering: IconTouchpadMouse,
  grab: IconPanTool,
  grabbing: IconPanTool,
  dragging: IconDragPan,
}

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
