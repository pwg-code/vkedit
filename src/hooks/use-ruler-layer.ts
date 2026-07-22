/*
标尺图层
*/

import { computed, ref } from 'vue'
import { useStage } from './use-stage'
import { cssColorVar } from '@/utils/css-var'
import type { EditorHost } from '@/core'

const RULER_SIZE = 25

export function useRulerLayer(host: EditorHost) {
  const { width, height } = useStage(host)

  const rulerLayerRef = ref()
  const upRulerShapeRef = ref()
  const leftRulerShapeRef = ref()

  // 标尺图层配置
  const rulerLayerConfig = computed(() => {
    return { listening: false }
  })

  const themeEl = () => host.stageState.wrapperEl

  // 上标尺
  const upRulerConfig = computed(() => {
    const el = themeEl()
    return {
      x: 0,
      y: 0,
      width: width.value,
      height: RULER_SIZE,
      fill: cssColorVar('--vkedit-color-surface-solid', el),
      stroke: cssColorVar('--vkedit-color-border', el),
      strokeWidth: 1,
      listening: false,
    }
  })

  // 左标尺
  const leftRulerConfig = computed(() => {
    const el = themeEl()
    return {
      x: 0,
      y: 0,
      width: RULER_SIZE,
      height: height.value,
      fill: cssColorVar('--vkedit-color-surface-solid', el),
      stroke: cssColorVar('--vkedit-color-border', el),
      strokeWidth: 1,
      listening: false,
    }
  })

  // 左上交叉区：实色 + 右/下分隔，消除上/左重叠脏边
  const cornerConfig = computed(() => {
    const el = themeEl()
    return {
      x: 0,
      y: 0,
      width: RULER_SIZE,
      height: RULER_SIZE,
      fill: cssColorVar('--vkedit-color-surface-solid', el),
      strokeEnabled: false,
      listening: false,
    }
  })

  const cornerEdgeConfigs = computed(() => {
    const el = themeEl()
    const border = cssColorVar('--vkedit-color-border', el)
    const s = RULER_SIZE
    return {
      right: {
        points: [s - 0.5, 0, s - 0.5, s],
        stroke: border,
        strokeWidth: 1,
        listening: false,
      },
      bottom: {
        points: [0, s - 0.5, s, s - 0.5],
        stroke: border,
        strokeWidth: 1,
        listening: false,
      },
    }
  })

  return {
    rulerLayerRef,
    rulerLayerConfig,
    upRulerConfig,
    leftRulerConfig,
    cornerConfig,
    cornerEdgeConfigs,
    upRulerShapeRef,
    leftRulerShapeRef,
    RULER_SIZE,
  }
}
