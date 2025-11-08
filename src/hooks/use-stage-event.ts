import type { Point2D } from '@/types'
import type { EditorHost } from '@/core'
import { ref } from 'vue'
import { useStage, useHostState } from '@/hooks'

export function useStageEvent(host: EditorHost) {
  // 画布状态
  const { hostState } = useHostState(host)
  const { stageWrapperRef } = useStage()

  const transformOrigin = ref({ x: 0, y: 0 })

  // 鼠标按下
  const handleClick = (event: any) => {
    const point = getEventPoint(event)
    host.emit('stage:click', { point, ...event, source: 'use-stage-event', timestamp: Date.now() })
  }

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    const point = getEventPoint(event)
    host.emit('stage:mousedown', {
      point,
      ...event,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)
    host.emit('stage:mousemove', {
      point,
      ...event,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)
    host.emit('stage:mouseup', {
      point,
      ...event,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  function handleWheel(e: any) {
    host.emit('stage:wheel', { ...e, source: 'use-stage-event', timestamp: Date.now() })
  }

  // 键盘事件
  function handleKeyDown(event: any) {
    host.emit('stage:keydown', { evt: event, source: 'use-stage-event', timestamp: Date.now() })
    if (event.code == 'Delete') {
      host.emit('stage:keydown-delete', {
        evt: event,
        source: 'use-stage-event',
        timestamp: Date.now(),
      })
    } else if (event.code == 'ArrowLeft') {
      host.emit('stage:keydown-left', {
        evt: event,
        source: 'use-stage-event',
        timestamp: Date.now(),
      })
    } else if (event.code == 'ArrowRight') {
      host.emit('stage:keydown-right', {
        evt: event,
        source: 'use-stage-event',
        timestamp: Date.now(),
      })
    } else if (event.code == 'ArrowUp') {
      host.emit('stage:keydown-up', { ...event, source: 'use-stage-event', timestamp: Date.now() })
    } else if (event.code == 'ArrowDown') {
      host.emit('stage:keydown-down', {
        evt: event,
        source: 'use-stage-event',
        timestamp: Date.now(),
      })
    }
  }

  // 鼠标离开舞台
  function handleMouseleave(event: any) {
    host.emit('stage:mouseleave', { ...event, source: 'use-stage-event', timestamp: Date.now() })
  }

  // 处理上下文菜单事件
  function handleContextmenu(event: any) {
    // 阻止默认右键菜单
    event.evt.preventDefault()
    host.emit('stage:contextmenu', { ...event, source: 'use-stage-event', timestamp: Date.now() })
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
    handleContextmenu,
  }
}
