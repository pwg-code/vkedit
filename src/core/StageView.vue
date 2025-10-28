<template>
  <div
    class="flex-1 w-full bg-gray-200"
    tabindex="0"
    ref="stageWrapperRef"
    @keydown="handleKeyDown"
  >
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @click="handleClick"
      @pointerout="handlePointerOut"
    >
      <BgLayer :host="host"></BgLayer>
      <ContentLayer :host="host"> <SelectionLayer :host="host"></SelectionLayer></ContentLayer>
      <RulerLayer :host="host"></RulerLayer>
      <ScrollbarLayer :host="host"></ScrollbarLayer>
    </v-stage>
    <Zoom :host="host"></Zoom>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { IEditorHost } from '../types'
import { useStageEvent, useStage } from '@/hooks'
import Zoom from './Zoom.vue'
import BgLayer from './BgLayer.vue'
import RulerLayer from './RulerLayer.vue'
import ScrollbarLayer from './ScrollbarLayer.vue'
import ContentLayer from './ContentLayer.vue'
import SelectionLayer from './SelectionLayer.vue'

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()

// 使用舞台hook
const { stageRef, stageWrapperRef, stageConfig } = useStage()

function handlePointerOut(event: any) {
  console.log('鼠标离开', event)
}

const { handleClick, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleKeyDown } =
  useStageEvent(props.host)

onMounted(() => {})
</script>

<style scoped></style>
