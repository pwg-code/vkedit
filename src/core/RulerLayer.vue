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
import type { EditorHost } from '@/core'
import konva from 'konva'
import { computed, watch } from 'vue'
import { round } from 'lodash'

const rulerTextColor = '#333'
const rulerTickColor = '#666'

const { host } = defineProps<{ host: EditorHost }>()

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

// 获取舞台宽高
const { width, height } = useStage()

// 比例、内容宽高\滚动 变化时 更新标尺位置
watch(
  [zoom, hostState, contentScrollX, contentScrollY],
  () => {
    // 触发标尺重绘
    const node = rulerLayerRef.value?.getNode()
    if (!node) return
    node.draw()
  },
  { deep: true },
)

// 定义刻度间距最大最小值 避免过密或过稀
const minSpacing = 10
// 1mm刻度间距
const mm1Spacing = computed(() => hostState.dpm * zoom.value)
// 五毫米刻度间距
const mm5Spacing = computed(() => mm1Spacing.value * 5)
// 十毫米刻度间距
const mm10Spacing = computed(() => mm1Spacing.value * 10)
// 1mm线条高度
const mm1Height = 5
// 5mm线条高度
const mm5Height = 10
// 10mm线条高度
const mm10Height = 13
// 尺子总高度
const rulerHeight = 25
// 显示文字的最小间距
const labelMinSpacing = 30

// 上标尺刻度绘制函数
const upSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  // 绘制上标尺刻度的逻辑
  context.beginPath()

  // 以当前滚动位置为0点 向两边绘制刻度
  // 先向左绘制
  let currentX = contentScrollX.value
  while (currentX > rulerHeight && mm1Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm1Height)
    context.lineTo(currentX, rulerHeight)
    currentX -= mm1Spacing.value
  }

  // 向右绘制
  currentX = contentScrollX.value
  while (currentX <= width.value && mm1Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm1Height)
    context.lineTo(currentX, rulerHeight)
    currentX += mm1Spacing.value
  }

  // 向左绘画5mm刻度
  currentX = contentScrollX.value
  while (currentX > rulerHeight && mm5Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm5Height)
    context.lineTo(currentX, rulerHeight)
    currentX -= mm5Spacing.value
  }

  // 向右绘画5mm刻度
  currentX = contentScrollX.value
  while (currentX < width.value && mm5Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm5Height)
    context.lineTo(currentX, rulerHeight)
    currentX += mm5Spacing.value
  }

  // 向左绘画10mm刻度
  currentX = contentScrollX.value
  while (currentX > rulerHeight && mm10Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm10Height)
    context.lineTo(currentX, rulerHeight)

    // 当间隔大于50像素时 绘制刻度数字
    if (mm10Spacing.value >= labelMinSpacing) {
      const mmValue = round((contentScrollX.value - currentX) / mm1Spacing.value)
      context.font = '10px Arial'
      context.fillStyle = rulerTextColor
      context.fillText(`${mmValue}`, currentX - 2, 10)
    }

    currentX -= mm10Spacing.value
  }

  // 向右绘画10mm刻度
  currentX = contentScrollX.value
  while (currentX < width.value && mm10Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(currentX, rulerHeight - mm10Height)
    context.lineTo(currentX, rulerHeight)

    // 当间隔大于50像素时 绘制刻度数字
    if (mm10Spacing.value >= labelMinSpacing) {
      const mmValue = round((currentX - contentScrollX.value) / mm1Spacing.value)
      context.font = '10px Arial'
      context.fillStyle = rulerTextColor
      context.fillText(`${mmValue}`, currentX - 2, 10)
    }
    currentX += mm10Spacing.value
  }

  context.closePath()
  context.fillStrokeShape(shape)
}

// 上标尺刻度配置
const upRulerShapeConfig = {
  // 这里是上标尺刻度的配置
  sceneFunc: upSceneFunc,
  stroke: rulerTickColor,
  strokeWidth: 1,
}

// 左标尺刻度绘制函数
const leftSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  let currentY = contentScrollY.value
  context.beginPath()
  // 向上绘制1mm刻度
  while (currentY > rulerHeight && mm1Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm1Height, currentY)
    context.lineTo(rulerHeight, currentY)
    currentY -= mm1Spacing.value
  }
  // 向下绘制1mm刻度
  currentY = contentScrollY.value
  while (currentY <= height.value && mm1Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm1Height, currentY)
    context.lineTo(rulerHeight, currentY)
    currentY += mm1Spacing.value
  }
  // 向上绘制5mm刻度
  currentY = contentScrollY.value
  while (currentY > rulerHeight && mm5Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm5Height, currentY)
    context.lineTo(rulerHeight, currentY)
    currentY -= mm5Spacing.value
  }
  // 向下绘制5mm刻度
  currentY = contentScrollY.value
  while (currentY <= height.value && mm5Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm5Height, currentY)
    context.lineTo(rulerHeight, currentY)
    currentY += mm5Spacing.value
  }
  // 向上绘制10mm刻度
  currentY = contentScrollY.value
  while (currentY > rulerHeight && mm10Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm10Height, currentY)
    context.lineTo(rulerHeight, currentY)
    currentY -= mm10Spacing.value
    // 当间隔大于50像素时 绘制刻度数字
    if (mm10Spacing.value >= labelMinSpacing) {
      const mmValue = round((contentScrollY.value - currentY) / mm1Spacing.value)
      context.font = '10px Arial'
      context.fillStyle = rulerTextColor
      context.fillText(`${mmValue}`, rulerHeight - 20, currentY - 2)
    }
  }
  // 向下绘制10mm刻度
  currentY = contentScrollY.value
  while (currentY <= height.value && mm10Spacing.value >= minSpacing) {
    // 绘制逻辑
    context.moveTo(rulerHeight - mm10Height, currentY)
    context.lineTo(rulerHeight, currentY)
    // 当间隔大于50像素时 绘制刻度数字
    if (mm10Spacing.value >= labelMinSpacing) {
      const mmValue = round((currentY - contentScrollY.value) / mm1Spacing.value)
      context.font = '10px Arial'
      context.fillStyle = rulerTextColor
      context.fillText(`${mmValue}`, rulerHeight - 20, currentY - 2)
    }
    currentY += mm10Spacing.value
  }
  context.closePath()
  context.fillStrokeShape(shape)
}

// 左标尺刻度配置
const leftRulerShapeConfig = {
  // 这里是左标尺刻度的配置
  sceneFunc: leftSceneFunc,
  stroke: rulerTickColor,
  strokeWidth: 1,
}
</script>

<style scoped></style>
