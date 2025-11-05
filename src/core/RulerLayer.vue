<template>
  <!-- 标尺图层 -->
  <v-layer ref="rulerLayerRef" :config="rulerLayerConfig">
    <!-- 上标尺 -->
    <v-rect :config="upRulerConfig"></v-rect>
    <!-- 使用v-shape画上标尺刻度 -->
    <v-shape :config="upRulerShapeConfig" ref="upRulerShapeRef"></v-shape>

    <!-- 左标尺 -->
    <v-rect :config="leftRulerConfig"></v-rect>
    <v-shape :config="leftRulerShapeConfig" ref="leftRulerShapeRef"></v-shape>
  </v-layer>
</template>

<script setup lang="ts">
import { useRulerLayer, useStage, useZoom } from '@/hooks'
import { useHostState } from '@/hooks/use-host-state'
import { useScrollbarLayer } from '@/hooks/use-scrollbar-layer'
import type { IEditorHost } from '@/types'
import konva from 'konva'
import { watch } from 'vue'

const { host } = defineProps<{ host: IEditorHost }>()

// 标尺hook
const {
  rulerLayerRef,
  upRulerConfig,
  leftRulerConfig,
  rulerLayerConfig,
  leftRulerShapeRef,
  upRulerShapeRef,
} = useRulerLayer()

const { hostState } = useHostState(host)

const { contentScrollX, contentScrollY } = useScrollbarLayer(host)

// 获取zoom比例
const { zoom } = useZoom(host)

// 比例变化时 更新标尺位置
watch(zoom, () => {
  // 触发标尺重绘
  rulerLayerRef.value.getNode().draw()
})

// 获取舞台宽高
const { width, height } = useStage()

// 上标尺刻度绘制函数
const upSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  // 绘制上标尺刻度的逻辑
  context.beginPath()

  // 定义刻度间距最大最小值 避免过密或过稀
  const minSpacing = 5
  const maxSpacing = 50

  // 1mm刻度间距
  const mm1Spacing = hostState.dpm * zoom.value
  // 五毫米刻度间距
  const mm5Spacing = mm1Spacing * 5 * zoom.value
  // 十毫米刻度间距
  const mm10Spacing = mm1Spacing * 10 * zoom.value
  // 50毫米刻度间距
  const mm50Spacing = mm1Spacing * 50 * zoom.value

  let currentX = mm1Spacing
  // 绘画1mm刻度
  while (currentX < width.value) {
    // 绘制逻辑
    context.moveTo(currentX, 0)
    context.lineTo(currentX, 5)
    currentX += mm1Spacing
  }

  // 绘画5mm刻度
  currentX = mm5Spacing
  while (currentX < width.value) {
    // 绘制逻辑
    context.moveTo(currentX, 0)
    context.lineTo(currentX, 10)
    currentX += mm5Spacing
  }

  // 绘画10mm刻度
  currentX = mm10Spacing
  while (currentX < width.value) {
    // 绘制逻辑
    context.moveTo(currentX, 0)
    context.lineTo(currentX, 15)
    currentX += mm10Spacing
  }

  // 绘画50mm刻度
  currentX = mm50Spacing
  while (currentX < width.value) {
    // 绘制逻辑
    context.moveTo(currentX, 0)
    context.lineTo(currentX, 20)
    currentX += mm50Spacing
  }
  context.closePath()
  context.fillStrokeShape(shape)
}

// 上标尺刻度配置
const upRulerShapeConfig = {
  // 这里是上标尺刻度的配置
  sceneFunc: upSceneFunc,
  stroke: 'black',
  strokeWidth: 1,
}

// 左标尺刻度绘制函数
const leftSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  // 绘制左标尺刻度的逻辑
}

// 左标尺刻度配置
const leftRulerShapeConfig = {
  // 这里是左标尺刻度的配置
  sceneFunc: leftSceneFunc,
  stroke: 'black',
  strokeWidth: 1,
}
</script>

<style scoped></style>
