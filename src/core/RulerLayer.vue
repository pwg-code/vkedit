<template>
  <!-- 标尺图层 -->
  <v-layer ref="rulerLayerRef" :config="rulerLayerConfig">
    <!-- 上标尺 -->
    <v-rect :config="upRulerConfig"></v-rect>
    <!-- 左标尺 -->
    <v-rect :config="leftRulerConfig"></v-rect>
  </v-layer>
</template>

<script setup lang="ts">
import { useRulerLayer } from '@/hooks'

// 标尺hook
const { rulerLayerRef, upRulerConfig, leftRulerConfig, rulerLayerConfig } = useRulerLayer()
</script>

<style scoped></style>
