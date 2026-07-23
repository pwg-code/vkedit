/*
框选图层
*/

import { computed, ref } from 'vue'
import { cssColorMix, cssColorVar } from '@/utils/css-var'
import { isClickOnTransformOverlay } from '@/utils/transform-overlay'
import type { Point2D } from '@/types'
import type { EditorHost } from '@/core'

/** 框选填充：primary @ 16%（设计参数） */
const SELECTION_FILL_OPACITY = 16

export function useSelectionLayer(host: EditorHost) {
  const isSelecting = ref(false)
  const selectionStart = ref<Point2D>({ x: 0, y: 0 })
  const selectionEnd = ref<Point2D>({ x: 0, y: 0 })

  // 图层配置
  const selectionLayerConfig = ref({})

  // 计算矩形配置
  const rectConfig = computed(() => {
    const el = host.stageState.wrapperEl
    const x = Math.min(selectionStart.value.x, selectionEnd.value.x)
    const y = Math.min(selectionStart.value.y, selectionEnd.value.y)
    const w = Math.abs(selectionEnd.value.x - selectionStart.value.x)
    const h = Math.abs(selectionEnd.value.y - selectionStart.value.y)
    return {
      x,
      y,
      width: w,
      height: h,
      fill: cssColorMix('--vkedit-color-primary', SELECTION_FILL_OPACITY, el),
      stroke: cssColorVar('--vkedit-color-primary', el),
      strokeWidth: 1,
      listening: false,
    }
  })

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    if (event.evt.button !== 0) return
    if (host.status.currentTool !== 'select') return
    if (isClickOnTransformOverlay(event)) return
    const point = event.point
    isSelecting.value = true
    selectionStart.value = event.point
    selectionEnd.value = point
  }

  const handleMouseMove = (event: any) => {
    const point = event.point
    if (isSelecting.value) {
      selectionEnd.value = point
    }
  }

  const handleMouseUp = () => {
    isSelecting.value = false
  }

  const handleMouseLeave = () => {
    isSelecting.value = false
  }

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    rectConfig,
    selectionLayerConfig,
  }
}
