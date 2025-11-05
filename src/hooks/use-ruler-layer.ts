/*
标尺图层
*/

import { computed, ref } from 'vue'
import { useStage } from './use-stage'

export function useRulerLayer() {
  const { width, height } = useStage()

  const rulerLayerRef = ref()
  const upRulerShapeRef = ref()
  const leftRulerShapeRef = ref()

  // 标尺图层配置
  const rulerLayerConfig = computed(() => {
    return { listening: false }
  })

  // 上标尺
  const upRulerConfig = computed(() => {
    return { x: 0, y: 0, width: width.value, height: 10, fill: '#6666', listening: false }
  })

  // 左标尺
  const leftRulerConfig = computed(() => {
    return { x: 0, y: 0, width: 10, height: height.value, fill: '#6666', listening: false }
  })

  return {
    rulerLayerRef,
    rulerLayerConfig,
    upRulerConfig,
    leftRulerConfig,
    upRulerShapeRef,
    leftRulerShapeRef,
  }
}
