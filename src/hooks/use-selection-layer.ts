/*
框选图层
*/

import { computed, onMounted, reactive, ref, watch } from 'vue'
import useStage from './use-stage'
import type { IEditorHost, Point2D } from '@/types'
import { EditorEvents } from '@/types'

export default function (host: IEditorHost) {
  const { width, height } = useStage()
  const isSelecting = ref(false)
  const selectionStart = ref<Point2D>({ x: 0, y: 0 })
  const selectionEnd = ref<Point2D>({ x: 0, y: 0 })

  // 图层配置
  const selectionLayerConfig = ref({
  })

  // 计算矩形配置
  const rectConfig = computed(() => {
    const x = Math.min(selectionStart.value.x, selectionEnd.value.x)
    const y = Math.min(selectionStart.value.y, selectionEnd.value.y)
    const width = Math.abs(selectionEnd.value.x - selectionStart.value.x)
    const height = Math.abs(selectionEnd.value.y - selectionStart.value.y)
    return {
      x,
      y,
      width,
      height,
      fill: 'rgba(52, 152, 219, 0.2)',
      stroke: '#3498db',
      strokeWidth: 1,
      dash: [4, 4],
      listening: false, // 不响应事件
    }
  })

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    const point = event.point
    if (host.getState().currentTool === 'select') {
      isSelecting.value = true
      selectionStart.value = event.point
      selectionEnd.value = point
    }
  }

  const handleMouseMove = (event: any) => {
    const point = event.point
    if (isSelecting.value) {
      selectionEnd.value = point
    }
  }

  const handleMouseUp = (event: any) => {
    isSelecting.value = false
  }

  const handlePMouseleave = (event: any) => {
    isSelecting.value = false
  }

  onMounted(() => {
    host.on(EditorEvents.CANVAS_MOUSE_DOWN, handleMouseDown)
    host.on(EditorEvents.CANVAS_MOUSE_MOVE, handleMouseMove)
    host.on(EditorEvents.CANVAS_MOUSE_UP, handleMouseUp)
    host.on(EditorEvents.CANVAS_MOUSE_LEAVE, handlePMouseleave)
  })

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    rectConfig,
    selectionLayerConfig,
  }
}
