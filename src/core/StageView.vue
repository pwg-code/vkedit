<template>
  <div
    class="vkedit-stage-view"
    tabindex="0"
    ref="stageWrapperRef"
    @keydown="handleKeyDownWithSpace"
    @keyup="handleKeyUp"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
    :style="{ cursor: cursorStyle }"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @click="handleClick"
      @dblclick="handleDblClick"
      @contextmenu="handleContextmenu"
    >
      <BgLayer :host="host"></BgLayer>
      <ContentLayer :host="host"> <SelectionLayer :host="host"></SelectionLayer></ContentLayer>
      <RulerLayer :host="host"></RulerLayer>
    </v-stage>
    <StatusBar :host="host"></StatusBar>
    <HelpGuide></HelpGuide>
    <ContextMenu :host="host"></ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { EditorHost } from '@/core'
import type { CursorMode } from '@/types'
import { useStageEvent, useStage, useZoom } from '@/hooks'
import StatusBar from './StatusBar.vue'
import BgLayer from './BgLayer.vue'
import RulerLayer from './RulerLayer.vue'
import ContentLayer from './ContentLayer.vue'
import SelectionLayer from './SelectionLayer.vue'
import ContextMenu from './ContextMenu.vue'
import HelpGuide from './HelpGuide.vue'

interface Props {
  host: EditorHost
}

const props = defineProps<Props>()

// DOM 引用由本组件本地持有（绑定模板 ref），不再走全局 store
const stageRef = ref()
const stageWrapperRef = ref<HTMLElement | null>(null)
const { width: vpWidth, height: vpHeight } = useElementSize(stageWrapperRef)

// 同步视口尺寸到 host.stageState（供下游 hook 响应式读取）
watch([vpWidth, vpHeight], () => {
  props.host.stageState.viewportWidth = vpWidth.value
  props.host.stageState.viewportHeight = vpHeight.value
}, { immediate: true })

const { stageConfig, currentCursorMode, spacePressed, isPanning } = useStage(props.host)
const { handleWheel: handleWheelZoom } = useZoom(props.host)

const {
  handleClick,
  handleDblClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel: handleWheelEvent,
  handleKeyDown,
  handleMouseenter,
  handleMouseleave,
  handleContextmenu,
  handleSpaceDown,
  handleSpaceUp,
  panThresholdMet,
} = useStageEvent(props.host)

const cursorStyle = computed(() => {
  const modeMap: Record<CursorMode, string> = {
    'default': 'default',
    'hovering': 'default',
    'grab': 'grab',
    'grabbing': 'grabbing',
    'dragging': 'move',
  }
  return modeMap[currentCursorMode.value] || 'default'
})

const handleWheel = (e: Parameters<typeof handleWheelZoom>[0]) => {
  handleWheelEvent(e)
  handleWheelZoom(e)
}

const handleKeyDownWithSpace = (e: KeyboardEvent) => {
  handleKeyDown(e)
  handleSpaceDown(e)
}

const handleKeyUp = (e: KeyboardEvent) => {
  handleSpaceUp(e)
}

const handleWindowBlur = () => {
  spacePressed.value = false
  isPanning.value = false
  panThresholdMet.value = false
  currentCursorMode.value = 'default'
}

onMounted(() => {
  props.host.stage = stageRef.value
  props.host.stageState.wrapperEl = stageWrapperRef.value
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('keydown', handleSpaceDown)
  window.addEventListener('keyup', handleSpaceUp)
})

onUnmounted(() => {
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('keydown', handleSpaceDown)
  window.removeEventListener('keyup', handleSpaceUp)
})
</script>

<style scoped></style>
