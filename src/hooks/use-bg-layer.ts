/*
背景图层
*/

import { computed } from 'vue'
import { useStage } from './use-stage'
import { useZoom } from './use-zoom'
import { useScrollbarLayer } from './use-scrollbar-layer'
import type { IEditorHost } from '@/types'

export function useBgLayer(host: IEditorHost) {
  const { width, height } = useStage()
  // 缩放逻辑hook
  const { contentHeight, contentWidth } = useZoom(host)
  const { contentScrollX, contentScrollY } = useScrollbarLayer(host)

  // 标尺图层配置
  const bgLayerConfig = computed(() => {
    return { listening: false }
  })

  // 上标尺
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

  // 内容图层底板
  const contentBgConfig = computed(() => {
    return {
      x: contentScrollX.value,
      y: contentScrollY.value,
      width: contentWidth.value,
      height: contentHeight.value,
      fill: 'rgba(255, 255, 255, 1)',
      listening: false,
    }
  })

  return { bgLayerConfig, bgConfig, contentBgConfig }
}
