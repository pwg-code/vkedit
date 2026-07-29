/*
内容图层
*/

import { computed, ref } from 'vue'
import { useZoom } from './use-zoom'
import { type IGraphicElement } from '@/types'
import { type EditorHost } from '@/core'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'

export function useContentLayer(host: EditorHost) {
  // 图层
  const contentLayerRef = ref()

  // 缩放逻辑hook
  const { zoom, contentX, contentY } = useZoom(host)

  const contentLayerConfig = computed(() => {
    return {}
  })

  const contentGroupConfig = computed(() => {
    return {
      x: contentX.value,
      y: contentY.value,
      scaleX: zoom.value,
      scaleY: zoom.value,
    }
  })

  // 所有的图像元素
  const elements = ref<IGraphicElement[]>([])
  const initElements = () => {
    const manager = host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
    if (manager?.getOrderedElements) {
      // 按 zIndex 升序：底层在前，先渲染的在底部，后渲染的在顶部叠压
      elements.value = manager.getOrderedElements('ascending')
    } else {
      const a = manager?.elements.values()
      if (a) {
        elements.value = Array.from(a)
      }
    }
  }

  // 更新画布
  function updateCanvas() {
    elements.value = [...elements.value]
  }

  return {
    contentLayerRef,
    contentLayerConfig,
    contentGroupConfig,
    elements,
    initElements,
    updateCanvas,
  }
}
