<template>
  <!-- <v-layer :config="selectionLayerConfig"> -->
  <!-- <v-group> -->
  <v-rect v-if="isSelecting" :config="rectConfig" />
  <!-- </v-group> -->
  <!-- </v-layer> -->
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { type EditorHost } from '@/core'
import { useSelectionLayer } from '@/hooks/use-selection-layer'

const { host } = defineProps<{ host: EditorHost }>()
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
  host.on('stage:mousedown', handleMouseDown)
  host.on('stage:mousemove', handleMouseMove)
  host.on('stage:mouseup', handleMouseUp)
  host.on('stage:mouseleave', handlePMouseleave)
})
</script>

<style scoped>
/* 组件样式 */
</style>
