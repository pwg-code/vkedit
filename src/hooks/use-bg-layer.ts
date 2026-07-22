/*
背景图层
*/

import { computed } from 'vue'
import { useStage } from './use-stage'
import { useZoom } from './use-zoom'
import type { EditorHost } from '@/core'

export function useBgLayer(host: EditorHost) {
  const { width, height } = useStage(host)
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
      fill: '#6666', /* token-exception: editor canvas background */
      listening: false,
    }
  })

  const contentBgConfig = computed(() => {
    return {
      x: contentX.value,
      y: contentY.value,
      width: contentWidth.value,
      height: contentHeight.value,
      fill: 'rgba(255, 255, 255, 1)', /* token-exception: artboard page color */
      cornerRadius: 8,
      shadowColor: 'rgba(0, 0, 0, 0.4)', /* token-exception: page shadow */
      shadowBlur: 24,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowOpacity: 0.6,
      listening: false,
    }
  })

  return { bgLayerConfig, bgConfig, contentBgConfig }
}
