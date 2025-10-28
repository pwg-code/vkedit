import type { ElementsPlugin } from '@/plugins'
import type { IEditorHost, IEditorState, IGraphicElement, Point2D } from '@/types'
import { EditorEvents } from '@/types/EventTypes'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import useStage from './useStage'
import useHostState from './useHostState'

export default function (host: IEditorHost) {
  // 画布状态
  const { hostState } = useHostState(host)
  const { width, height, stageWrapperRef } = useStage()

  const scrollContainer = ref<HTMLElement | null>(null)
  const transformOrigin = ref({ x: 0, y: 0 })

  // 鼠标按下
  const handleClick = (event: any) => {
    const point = getEventPoint(event)
    host.emit(EditorEvents.CANVAS_CLICK, { point, ...event })
  }

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousedown', { point, ...event })
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousemove', { point, ...event })
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mouseup', { point, ...event })
  }

  function handleWheel(e: WheelEvent) {
    if (!stageWrapperRef.value || !scrollContainer.value) return

    e.preventDefault()

    const rect = stageWrapperRef.value.getBoundingClientRect()
    const containerRect = scrollContainer.value.getBoundingClientRect()

    const pointerX = e.clientX - containerRect.left
    const pointerY = e.clientY - containerRect.top

    transformOrigin.value = { x: pointerX, y: pointerY }

    const delta = e.deltaY
    const zoomFactor = 0.05
    const newScale = hostState.zoom - (delta * zoomFactor) / 100

    hostState.zoom = Math.min(Math.max(newScale, 0.2), 3)
  }

  // 键盘事件
  function handleKeyDown(event: any) {
    host.emit(EditorEvents.CANVAS_KEYDOWN, event)
    if (event.code == 'Delete') {
      host.emit(EditorEvents.CANVAS_KEYDOWN_DELETE, event)
    } else if (event.code == 'ArrowLeft') {
      host.emit(EditorEvents.CANVAS_KEYDOWN_LEFT, event)
    } else if (event.code == 'ArrowRight') {
      host.emit(EditorEvents.CANVAS_KEYDOWN_RIGHT, event)
    } else if (event.code == 'ArrowUp') {
      host.emit(EditorEvents.CANVAS_KEYDOWN_UP, event)
    } else if (event.code == 'ArrowDown') {
      host.emit(EditorEvents.CANVAS_KEYDOWN_DOWN, event)
    }
  }

  const getEventPoint = (event: any): Point2D => {
    const stage = event.target.getStage()
    const point = stage.getPointerPosition()
    return {
      x: point.x,
      y: point.y,
    }
  }

  return {
    stageWrapperRef,
    transformOrigin,
    hostState,
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    height,
    width,
  }
}
