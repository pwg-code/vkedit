import type { EditorHost } from '@/core'
import { computed, reactive, ref } from 'vue'
import { useHostState, useScrollbarLayer, useStage } from '@/hooks'

// 处理缩放相关的逻辑
export function useZoom(host: EditorHost) {
  const { hostState } = useHostState(host)
  const { width, height } = useStage()

  // 内容区的配置
  const contentWidth = computed(() => hostState.width * hostState.zoom)
  const contentHeight = computed(() => hostState.height * hostState.zoom)
  const contentX = computed(() => width.value / 2 - contentWidth.value / 2)
  const contentY = computed(() => height.value / 2 - contentHeight.value / 2)
  const zoom = computed(() => hostState.zoom)

  // 放大
  const handleZoomIn = (step: number = 0.1) => {
    if (hostState.zoom < 10) {
      hostState.zoom += step
    }
  }
  // 缩小
  const handleZoomOut = (step: number = 0.1) => {
    if (hostState.zoom > 0.1) {
      hostState.zoom -= step
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

  // 滚轮缩放
  const handleWheel = (e: any) => {
    if (e.evt.deltaY < 0) {
      handleZoomIn(0.05)
    } else {
      handleZoomOut(0.05)
    }
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
    handleWheel,
  }
}
