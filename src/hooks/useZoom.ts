import { computed, reactive, ref } from 'vue'

// 处理缩放相关的逻辑
export default function (stageConfig: any, hostState: any) {
  // 内容区的配置
  const contentWidth = computed(() => hostState.value.width * hostState.value.zoom)
  const contentHeight = computed(() => hostState.value.height * hostState.value.zoom)
  const contentX = computed(() => stageConfig.value.width / 2 - contentWidth.value / 2)
  const contentY = computed(() => stageConfig.value.height / 2 - contentHeight.value / 2)

  // 放大
  const handleZoomIn = () => {
    if (hostState.value.zoom < 3) {
      hostState.value.zoom += 0.1
    }
  }
  // 缩小
  const handleZoomOut = () => {
    if (hostState.value.zoom > 0.2) {
      hostState.value.zoom -= 0.1
    }
  }
  // 自适应缩放
  const handleZoomAuto = () => {
    // 长宽均不超出则为最佳
    const zoomX = (stageConfig.value.width - 100) / hostState.value.width
    const zoomY = (stageConfig.value.height - 100) / hostState.value.height
    // 取缩放最新值
    hostState.value.zoom = Math.min(zoomX, zoomY)
  }

  return {
    contentWidth,
    contentHeight,
    contentX,
    contentY,
    handleZoomIn,
    handleZoomOut,
    handleZoomAuto,
  }
}
