import type { EditorHost } from '@/core'
import { computed } from 'vue'
import { useHostState, useStage } from '@/hooks'

export function useZoom(host: EditorHost) {
  const { hostState } = useHostState(host)
  const { width, height, offsetX, offsetY } = useStage(host)

  const contentWidth = computed(() => hostState.width * hostState.zoom)
  const contentHeight = computed(() => hostState.height * hostState.zoom)
  const contentX = computed(() => width.value / 2 - contentWidth.value / 2 + offsetX.value)
  const contentY = computed(() => height.value / 2 - contentHeight.value / 2 + offsetY.value)
  const zoom = computed(() => hostState.zoom)

  const dynamicStep = computed(() => Math.max(0.01, hostState.zoom * 0.05))

  const performZoom = (newZoom: number, centerX?: number, centerY?: number) => {
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom))
    if (clampedZoom === hostState.zoom) return

    const zoomCenterX = centerX ?? width.value / 2
    const zoomCenterY = centerY ?? height.value / 2

    const oldContentX = width.value / 2 - contentWidth.value / 2 + offsetX.value
    const oldContentY = height.value / 2 - contentHeight.value / 2 + offsetY.value
    const relativeX = (zoomCenterX - oldContentX) / hostState.zoom
    const relativeY = (zoomCenterY - oldContentY) / hostState.zoom

    hostState.zoom = clampedZoom

    const newContentWidth = hostState.width * clampedZoom
    const newContentHeight = hostState.height * clampedZoom
    const newContentX = zoomCenterX - relativeX * clampedZoom
    const newContentY = zoomCenterY - relativeY * clampedZoom

    offsetX.value = newContentX - (width.value / 2 - newContentWidth / 2)
    offsetY.value = newContentY - (height.value / 2 - newContentHeight / 2)
  }

  const handleZoomIn = (step?: number) => {
    performZoom(hostState.zoom + (step ?? dynamicStep.value))
  }

  const handleZoomOut = (step?: number) => {
    performZoom(hostState.zoom - (step ?? dynamicStep.value))
  }

  const handleZoomAuto = () => {
    // 画布尺寸守卫：避免空文档/损坏 JSON 导致除零产生 Infinity zoom
    if (hostState.width <= 0 || hostState.height <= 0) return
    // 视口未就绪时跳过（由调用方决定是否延迟补执行）
    if (width.value <= 0 || height.value <= 0) return
    // 自适应目标：画布等比缩放后放入"宽=视口宽/2、高=视口高/2"的区域，
    // 保持画布原有宽高比不拉伸，左右各留约 1/4 视口宽度空白以避让浮动面板。
    const zoomX = (width.value * 0.5) / hostState.width
    const zoomY = (height.value * 0.5) / hostState.height
    const newZoom = Math.max(0.1, Math.min(10, Math.min(zoomX, zoomY)))
    resetPanOffset()
    hostState.zoom = newZoom
  }

  const handlePanByPixels = (deltaX: number, deltaY: number) => {
    offsetX.value += deltaX
    offsetY.value += deltaY
  }

  const resetPanOffset = () => {
    offsetX.value = 0
    offsetY.value = 0
  }

  const handleWheel = (e: { evt: WheelEvent & { deltaY: number; ctrlKey: boolean; shiftKey: boolean }; target: { getStage: () => { getPointerPosition: () => { x: number; y: number } } } }) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()

    if (e.evt.ctrlKey) {
      const step = dynamicStep.value
      const newZoom = e.evt.deltaY < 0
        ? hostState.zoom + step
        : hostState.zoom - step
      performZoom(newZoom, pointerPos.x, pointerPos.y)
    } else {
      const delta = e.evt.deltaY / hostState.zoom
      const deltaX = e.evt.shiftKey ? delta : 0
      const deltaY2 = e.evt.shiftKey ? 0 : delta
      handlePanByPixels(-deltaX, -deltaY2)
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
    dynamicStep,
    offsetX,
    offsetY,
    handlePanByPixels,
    resetPanOffset,
  }
}
