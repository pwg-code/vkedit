<template>
  <div
    class="flex-1 w-full bg-gray-200 relative"
    tabindex="0"
    ref="stageWrapperRef"
    @keydown="handleKeyDown"
    @mouseleave="handleMouseleave"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @click="handleClick"
      @contextmenu="handleContextmenu"
    >
      <BgLayer :host="host"></BgLayer>
      <ContentLayer :host="host"> <SelectionLayer :host="host"></SelectionLayer></ContentLayer>
      <RulerLayer :host="host"></RulerLayer>
      <ScrollbarLayer :host="host"></ScrollbarLayer>
    </v-stage>
    <Zoom :host="host"></Zoom>
    <ContextMenu :host="host"></ContextMenu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import { useStageEvent, useStage } from '@/hooks'
import Zoom from './Zoom.vue'
import BgLayer from './BgLayer.vue'
import RulerLayer from './RulerLayer.vue'
import ScrollbarLayer from './ScrollbarLayer.vue'
import ContentLayer from './ContentLayer.vue'
import SelectionLayer from './SelectionLayer.vue'
import ContextMenu from './ContextMenu.vue'

interface Props {
  host: EditorHost
}

const props = defineProps<Props>()

// 使用舞台hook
const { stageRef, stageWrapperRef, stageConfig } = useStage()

const {
  handleClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  handleKeyDown,
  handleMouseleave,
  handleContextmenu,
} = useStageEvent(props.host)

onMounted(() => {
  props.host.stage = stageRef.value
})
</script>

<style scoped></style>
