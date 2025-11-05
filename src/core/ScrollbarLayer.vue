<template>
  <!-- 滚动条图层 -->
  <v-layer ref="scrollbarLayerRef" :config="scrollbarLayerConfig">
    <!-- 垂直滚动条 -->
    <template v-if="showVerticalScroll">
      <v-rect :config="verticalTrackConfig"></v-rect>
      <v-rect :config="verticalThumbConfig" @dragmove="handleVerticalDragMove" @click.stop></v-rect>
    </template>

    <!-- 水平滚动条 -->
    <template v-if="showHorizontalScroll">
      <v-rect :config="horizontalTrackConfig"></v-rect>
      <v-rect
        :config="horizontalThumbConfig"
        @dragmove="handleHorizontalDragMove"
        @click.stop
      ></v-rect>
    </template>
  </v-layer>
</template>

<script setup lang="ts">
import { useScrollbarLayer } from '@/hooks/use-scrollbar-layer'
import { EditorEvents, type IEditorHost } from '@/types'
import { onMounted } from 'vue'

const { host } = defineProps<{ host: IEditorHost }>()

// 背景
const {
  scrollbarLayerRef,
  scrollbarLayerConfig,
  horizontalThumbConfig,
  horizontalTrackConfig,
  verticalThumbConfig,
  verticalTrackConfig,
  showVerticalScroll,
  showHorizontalScroll,
  handleVerticalDragMove,
  handleHorizontalDragMove,
  handleWheel,
} = useScrollbarLayer(host)

onMounted(() => {
  host.on(EditorEvents.CANVAS_WHEEL, handleWheel)
})
</script>

<style scoped></style>
