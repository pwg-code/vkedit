import type { ElementManagerPlugin } from '@/plugins'
import type { IEditorHost, IEditorState, IGraphicElement, Point2D } from '@/types'
import { EditorEvents } from '@/types/event-types'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStage, useHostState } from '@/hooks'

export function useStageEvent(host: IEditorHost) {
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
    host.emit(EditorEvents.CANVAS_MOUSE_DOWN, { point, ...event })
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)
    host.emit(EditorEvents.CANVAS_MOUSE_MOVE, { point, ...event })
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)
    host.emit(EditorEvents.CANVAS_MOUSE_UP, { point, ...event })
  }

  function handleWheel(e: WheelEvent) {
    host.emit(EditorEvents.CANVAS_WHEEL, e)
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

  // 鼠标离开舞台
  function handleMouseleave(event: any) {
    host.emit(EditorEvents.CANVAS_MOUSE_LEAVE, event)
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
    handleMouseleave,
  }
}
