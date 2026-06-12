/*
背景图层
*/

import { computed } from 'vue'
import { useStage } from './use-stage'
import { useZoom } from './use-zoom'
import type { EditorHost } from '@/core'

export function useBgLayer(host: EditorHost) {
  const { width, height } = useStage()
  const { contentHeight, contentWidth, contentX, contentY } = useZoom(host)

  const bgLayerConfig = computed(() => {
    return { listening: false }
  })

  const bgConfig = computed(() => {
    return {
      x: 0,
      y: 0,
      width: width.value,
      height: height.value,
      fill: '#6666',
      listening: false,
    }
  })

  const contentBgConfig = computed(() => {
    return {
      x: contentX.value,
      y: contentY.value,
      width: contentWidth.value,
      height: contentHeight.value,
      fill: 'rgba(255, 255, 255, 1)',
      listening: false,
    }
  })

  return { bgLayerConfig, bgConfig, contentBgConfig }
}
