import type { EditorHost } from '@/core'
import { computed, ref } from 'vue'
import { useHostState, useStage } from '@/hooks'

// 处理缩放相关的逻辑
export function useZoom(host: EditorHost) {
  const { hostState } = useHostState(host)
  const { width, height } = useStage()

  // 画布偏移量，用于实现以鼠标位置为中心的缩放
  const offsetX = ref(0)
  const offsetY = ref(0)

  // 内容区的配置
  const contentWidth = computed(() => hostState.width * hostState.zoom)
  const contentHeight = computed(() => hostState.height * hostState.zoom)
  const contentX = computed(() => width.value / 2 - contentWidth.value / 2 + offsetX.value)
  const contentY = computed(() => height.value / 2 - contentHeight.value / 2 + offsetY.value)
  const zoom = computed(() => hostState.zoom)

  /**
   * 执行缩放操作
   * @param newZoom 新的缩放值
   * @param centerX 缩放中心点X坐标（舞台坐标系）
   * @param centerY 缩放中心点Y坐标（舞台坐标系）
   */
  const performZoom = (newZoom: number, centerX?: number, centerY?: number) => {
    // 限制缩放范围
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom))
    if (clampedZoom === hostState.zoom) return

    // 如果没有指定中心点，则使用画布中心
    const zoomCenterX = centerX ?? width.value / 2
    const zoomCenterY = centerY ?? height.value / 2

    // 计算缩放前，鼠标位置相对于内容的坐标
    const oldContentX = width.value / 2 - contentWidth.value / 2 + offsetX.value
    const oldContentY = height.value / 2 - contentHeight.value / 2 + offsetY.value
    const relativeX = (zoomCenterX - oldContentX) / hostState.zoom
    const relativeY = (zoomCenterY - oldContentY) / hostState.zoom

    // 更新缩放值
    const oldZoom = hostState.zoom
    hostState.zoom = clampedZoom

    // 计算缩放后的新内容位置
    const newContentWidth = hostState.width * clampedZoom
    const newContentHeight = hostState.height * clampedZoom
    const newContentX = zoomCenterX - relativeX * clampedZoom
    const newContentY = zoomCenterY - relativeY * clampedZoom

    // 更新偏移量，使缩放围绕指定点进行
    offsetX.value = newContentX - (width.value / 2 - newContentWidth / 2)
    offsetY.value = newContentY - (height.value / 2 - newContentHeight / 2)
  }

  // 放大
  const handleZoomIn = (step: number = 0.1) => {
    performZoom(hostState.zoom + step)
  }

  // 缩小
  const handleZoomOut = (step: number = 0.1) => {
    performZoom(hostState.zoom - step)
  }

  // 自适应缩放
  const handleZoomAuto = () => {
    // 长宽均不超出则为最佳
    const zoomX = (width.value - 100) / hostState.width
    const zoomY = (height.value - 100) / hostState.height
    const newZoom = Math.min(zoomX, zoomY)

    // 重置偏移量并设置新缩放值
    offsetX.value = 0
    offsetY.value = 0
    hostState.zoom = newZoom
  }

  // 滚轮缩放
  const handleWheel = (e: any) => {
    e.evt.preventDefault()

    // 获取鼠标在舞台中的位置
    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()

    // 根据滚轮方向计算新的缩放值
    const step = 0.05
    const newZoom = e.evt.deltaY < 0 ? hostState.zoom + step : hostState.zoom - step

    // 以鼠标位置为中心进行缩放
    performZoom(newZoom, pointerPos.x, pointerPos.y)
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
