/*
背景图层
*/

import { computed } from 'vue'
import useStage from './use-stage'

export default function () {
  const { width, height } = useStage()

  // 标尺图层配置
  const bgLayerConfig = computed(() => {
    return { }
  })

  // 上标尺
  const bgConfig = computed(() => {
    return {
      x: 0,
      y: 0,
      width: width.value,
      height: height.value,
      fill: '#6666',
    }
  })

  return { bgLayerConfig, bgConfig }
}
