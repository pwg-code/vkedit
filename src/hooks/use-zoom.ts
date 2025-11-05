import type { IEditorHost } from '@/types'
import { computed, reactive, ref } from 'vue'
import { useHostState, useStage } from '@/hooks'

// 处理缩放相关的逻辑
export function useZoom(host: IEditorHost) {
  const { hostState } = useHostState(host)
  const { width, height } = useStage()

  // 内容区的配置
  const contentWidth = computed(() => hostState.width * hostState.zoom)
  const contentHeight = computed(() => hostState.height * hostState.zoom)
  const contentX = computed(() => width.value / 2 - contentWidth.value / 2)
  const contentY = computed(() => height.value / 2 - contentHeight.value / 2)
  const zoom = computed(() => hostState.zoom)

  // 放大
  const handleZoomIn = () => {
    if (hostState.zoom < 3) {
      hostState.zoom += 0.1
    }
  }
  // 缩小
  const handleZoomOut = () => {
    if (hostState.zoom > 0.2) {
      hostState.zoom -= 0.1
    }
  }
  // 自适应缩放
  const handleZoomAuto = () => {
    // 长宽均不超出则为最佳
    const zoomX = (width.value - 100) / hostState.width
    const zoomY = (height.value - 100) / hostState.height
    // 取缩放最新值
    hostState.zoom = Math.min(zoomX, zoomY)
  }

  return {
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    handleZoomIn,
    handleZoomOut,
    handleZoomAuto,
    zoom,
  }
}
