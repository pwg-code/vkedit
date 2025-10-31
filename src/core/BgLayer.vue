<template>
  <!-- 背景图层 -->
  <v-layer ref="bgLayerRef" :config="bgLayerConfig">
    <!-- 背景 -->
    <v-rect :config="bgConfig"></v-rect>
    <!-- 内容背景 -->
    <v-rect :config="contentBgConfig"></v-rect>
    <!-- <v-shape :config="config"></v-shape> -->
  </v-layer>
</template>

<script setup lang="ts">
import { useBgLayer } from '@/hooks'
import type { IEditorHost } from '@/types'
import { ref } from 'vue'
import konva from 'konva'

const { host } = defineProps<{ host: IEditorHost }>()
// 背景
const { bgConfig, bgLayerConfig, contentBgConfig } = useBgLayer(host)

const config = ref<konva.ShapeConfig>({
  stroke: 'black',
  strokeWidth: 1,
  sceneFunc,
})
// 绘制函数
function sceneFunc(context: konva.Context, shape: konva.Shape) {
  context.beginPath()
  context.moveTo(50, 50)
  context.lineTo(50, 500)
  context.closePath()
  context.fillStrokeShape(shape)
}
</script>

<style scoped></style>
