<template>
  <!-- <v-layer :config="selectionLayerConfig"> -->
  <!-- <v-group> -->
  <v-rect v-if="isSelecting" :config="rectConfig" />
  <!-- </v-group> -->
  <!-- </v-layer> -->
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { EditorEvents, type IEditorHost, type Point2D } from '../types'
import useSelectionLayer from '@/hooks/use-selection-layer'

const { host } = defineProps<{ host: IEditorHost }>()
const {
  rectConfig,
  isSelecting,
  selectionLayerConfig,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handlePMouseleave,
} = useSelectionLayer(host)

onMounted(() => {
  host.on(EditorEvents.CANVAS_MOUSE_DOWN, handleMouseDown)
  host.on(EditorEvents.CANVAS_MOUSE_MOVE, handleMouseMove)
  host.on(EditorEvents.CANVAS_MOUSE_UP, handleMouseUp)
  host.on(EditorEvents.CANVAS_MOUSE_LEAVE, handlePMouseleave)
})
</script>

<style scoped>
/* 组件样式 */
</style>
