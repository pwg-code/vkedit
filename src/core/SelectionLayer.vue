<template>
  <!-- <v-layer :config="selectionLayerConfig"> -->
  <!-- <v-group> -->
  <v-rect v-if="isSelecting" :config="rectConfig" />
  <!-- </v-group> -->
  <!-- </v-layer> -->
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { IEditorHost, Point2D } from '../types'
import useSelectionLayer from '@/hooks/use-selection-layer'

const { host } = defineProps<{ host: IEditorHost }>()
const { rectConfig, isSelecting, selectionLayerConfig } = useSelectionLayer(host)
</script>

<style scoped>
/* 组件样式 */
</style>
