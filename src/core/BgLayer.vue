<template>
  <!-- 背景图层 -->
  <v-layer ref="bgLayerRef" :config="bgLayerConfig">
    <!-- 背景 -->
    <v-rect :config="bgConfig"></v-rect>
    <!-- 内容背景 -->
    <v-rect :config="contentBgConfig"></v-rect>

  </v-layer>
</template>

<script setup lang="ts">
import { useBgLayer } from '@/hooks'
import type { IEditorHost } from '@/types'

const { host } = defineProps<{ host: IEditorHost }>()
// 背景
const { bgConfig, bgLayerConfig ,contentBgConfig} = useBgLayer(host)


</script>

<style scoped></style>
