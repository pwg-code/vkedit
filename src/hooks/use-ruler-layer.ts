/*
标尺图层
*/

import { computed, ref } from 'vue'
import useStage from './use-stage'

export default function () {
  const { width, height } = useStage()

  const rulerLayerRef = ref()

  // 标尺图层配置
  const rulerLayerConfig = computed(() => {
    return { }
  })

  // 上标尺
  const upRulerConfig = computed(() => {
    return { x: 0, y: 0, width: width.value, height: 10, fill: '#6666' }
  })

  // 左标尺
  const leftRulerConfig = computed(() => {
    return { x: 0, y: 0, width: 10, height: height.value, fill: '#6666' }
  })

  return { rulerLayerRef, rulerLayerConfig, upRulerConfig, leftRulerConfig }
}
