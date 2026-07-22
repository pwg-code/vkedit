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

    <!-- 左上交叉区（后绘盖住重叠脏边） -->
    <v-rect :config="cornerConfig"></v-rect>
    <v-line :config="cornerEdgeConfigs.right"></v-line>
    <v-line :config="cornerEdgeConfigs.bottom"></v-line>
  </v-layer>
</template>

<script setup lang="ts">
import { useRulerLayer, useStage, useZoom } from '@/hooks'
import { useHostState } from '@/hooks/use-host-state'
import { cssColorVar, cssVar } from '@/utils/css-var'
import type { EditorHost } from '@/core'
import konva from 'konva'
import { computed, watch } from 'vue'
import { round } from 'lodash'

const { host } = defineProps<{ host: EditorHost }>()

const themeEl = () => host.stageState.wrapperEl

// 标尺hook
const {
  rulerLayerRef,
  upRulerConfig,
  leftRulerConfig,
  cornerConfig,
  cornerEdgeConfigs,
  rulerLayerConfig,
  leftRulerShapeRef,
  upRulerShapeRef,
} = useRulerLayer(host)

const { hostState } = useHostState(host)

const { contentX, contentY, zoom } = useZoom(host)

// 获取舞台宽高
const { width, height } = useStage(host)

// 比例、内容宽高\滚动 变化时 更新标尺位置
watch(
  [zoom, hostState, contentX, contentY],
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
// 1mm线条高度（最弱）
const mm1Height = 5
// 5mm线条高度
const mm5Height = 10
// 10mm线条高度（最强刻度，仍弱于正文）
const mm10Height = 14
// 尺子总高度
const rulerHeight = 25
// 显示文字的最小间距
const labelMinSpacing = 30

// 刻度层级：用实色 text token，避免 border-* 半透明在 surface 上发虚看不见
function rulerColors() {
  const el = themeEl()
  return {
    tick1: cssColorVar('--vkedit-color-text-disabled', el),
    tick5: cssColorVar('--vkedit-color-text-muted', el),
    tick10: cssColorVar('--vkedit-color-text-secondary', el),
    text: cssColorVar('--vkedit-color-text-secondary', el),
    font: `10px ${cssVar('--vkedit-font-sans', el) || 'sans-serif'}`,
  }
}

function strokeTicks(
  context: konva.Context,
  color: string,
  draw: () => void,
) {
  context.beginPath()
  draw()
  context.setAttr('strokeStyle', color)
  context.setAttr('lineWidth', 1)
  context.setAttr('globalAlpha', 1)
  context.stroke()
}

// 上标尺刻度绘制函数
const upSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  const { tick1, tick5, tick10, text, font } = rulerColors()
  const sp1 = mm1Spacing.value
  const sp5 = mm5Spacing.value
  const sp10 = mm10Spacing.value

  // 1mm
  if (sp1 >= minSpacing) {
    strokeTicks(context, tick1, () => {
      let x = contentX.value
      while (x > rulerHeight) {
        context.moveTo(x, rulerHeight - mm1Height)
        context.lineTo(x, rulerHeight)
        x -= sp1
      }
      x = contentX.value
      while (x <= width.value) {
        context.moveTo(x, rulerHeight - mm1Height)
        context.lineTo(x, rulerHeight)
        x += sp1
      }
    })
  }

  // 5mm
  if (sp5 >= minSpacing) {
    strokeTicks(context, tick5, () => {
      let x = contentX.value
      while (x > rulerHeight) {
        context.moveTo(x, rulerHeight - mm5Height)
        context.lineTo(x, rulerHeight)
        x -= sp5
      }
      x = contentX.value
      while (x < width.value) {
        context.moveTo(x, rulerHeight - mm5Height)
        context.lineTo(x, rulerHeight)
        x += sp5
      }
    })
  }

  // 10mm + 数字
  if (sp10 >= minSpacing) {
    strokeTicks(context, tick10, () => {
      let x = contentX.value
      while (x > rulerHeight) {
        context.moveTo(x, rulerHeight - mm10Height)
        context.lineTo(x, rulerHeight)
        x -= sp10
      }
      x = contentX.value
      while (x < width.value) {
        context.moveTo(x, rulerHeight - mm10Height)
        context.lineTo(x, rulerHeight)
        x += sp10
      }
    })

    if (sp10 >= labelMinSpacing) {
      context.font = font
      context.fillStyle = text
      let x = contentX.value
      while (x > rulerHeight) {
        const mmValue = round((contentX.value - x) / sp1)
        context.fillText(`${mmValue}`, x - 2, 10)
        x -= sp10
      }
      x = contentX.value
      while (x < width.value) {
        const mmValue = round((x - contentX.value) / sp1)
        context.fillText(`${mmValue}`, x - 2, 10)
        x += sp10
      }
    }
  }

  context.fillStrokeShape(shape)
}

// 上标尺刻度配置
const upRulerShapeConfig = {
  sceneFunc: upSceneFunc,
  strokeEnabled: false,
  listening: false,
}

// 左标尺刻度绘制函数
const leftSceneFunc = (context: konva.Context, shape: konva.Shape) => {
  const { tick1, tick5, tick10, text, font } = rulerColors()
  const sp1 = mm1Spacing.value
  const sp5 = mm5Spacing.value
  const sp10 = mm10Spacing.value

  if (sp1 >= minSpacing) {
    strokeTicks(context, tick1, () => {
      let y = contentY.value
      while (y > rulerHeight) {
        context.moveTo(rulerHeight - mm1Height, y)
        context.lineTo(rulerHeight, y)
        y -= sp1
      }
      y = contentY.value
      while (y <= height.value) {
        context.moveTo(rulerHeight - mm1Height, y)
        context.lineTo(rulerHeight, y)
        y += sp1
      }
    })
  }

  if (sp5 >= minSpacing) {
    strokeTicks(context, tick5, () => {
      let y = contentY.value
      while (y > rulerHeight) {
        context.moveTo(rulerHeight - mm5Height, y)
        context.lineTo(rulerHeight, y)
        y -= sp5
      }
      y = contentY.value
      while (y <= height.value) {
        context.moveTo(rulerHeight - mm5Height, y)
        context.lineTo(rulerHeight, y)
        y += sp5
      }
    })
  }

  if (sp10 >= minSpacing) {
    strokeTicks(context, tick10, () => {
      let y = contentY.value
      while (y > rulerHeight) {
        context.moveTo(rulerHeight - mm10Height, y)
        context.lineTo(rulerHeight, y)
        y -= sp10
      }
      y = contentY.value
      while (y <= height.value) {
        context.moveTo(rulerHeight - mm10Height, y)
        context.lineTo(rulerHeight, y)
        y += sp10
      }
    })

    if (sp10 >= labelMinSpacing) {
      context.font = font
      context.fillStyle = text
      let y = contentY.value
      while (y > rulerHeight) {
        y -= sp10
        const mmValue = round((contentY.value - y) / sp1)
        context.fillText(`${mmValue}`, rulerHeight - 20, y - 2)
      }
      y = contentY.value
      while (y <= height.value) {
        const mmValue = round((y - contentY.value) / sp1)
        context.fillText(`${mmValue}`, rulerHeight - 20, y - 2)
        y += sp10
      }
    }
  }

  context.fillStrokeShape(shape)
}

// 左标尺刻度配置
const leftRulerShapeConfig = {
  sceneFunc: leftSceneFunc,
  strokeEnabled: false,
  listening: false,
}
</script>

<style scoped></style>
