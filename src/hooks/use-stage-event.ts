import type { IGraphicElement, Point2D } from '@/types'
import type { EditorHost } from '@/core'
import { ref } from 'vue'
import { useStage, useHostState, useZoom } from '@/hooks'

export function useStageEvent(host: EditorHost) {
  const { hostState } = useHostState(host)
  const { stageWrapperRef, currentCursorMode, spacePressed, mouseStageX, mouseStageY, isPanning } = useStage()
  const { handlePanByPixels } = useZoom(host)

  const transformOrigin = ref({ x: 0, y: 0 })

  const PAN_THRESHOLD = 3
  const panStartX = ref(0)
  const panStartY = ref(0)
  const panPrevX = ref(0)
  const panPrevY = ref(0)
  const panThresholdMet = ref(false)

  const handleSpaceDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return

    if (e.code === 'Space') {
      e.preventDefault()
      if (!spacePressed.value) {
        spacePressed.value = true
        currentCursorMode.value = 'grab'
      }
    }
  }

  const handleSpaceUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      spacePressed.value = false
      currentCursorMode.value = 'default'
      if (isPanning.value) {
        isPanning.value = false
        panThresholdMet.value = false
      }
    }
  }

  const handleClick = (event: any) => {
    const point = getEventPoint(event)
    host.emit('stage:click', { point, ...event, source: 'use-stage-event', timestamp: Date.now() })
  }

  const handleDblClick = (event: any) => {
    const point = getEventPoint(event)
    const { element, elementId } = getEventElement(event)
    host.emit('stage:dblclick', {
      ...event,
      point,
      element,
      elementId,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  const handleMouseDown = (event: any) => {
    const point = getEventPoint(event)

    if (spacePressed.value && event.evt.button === 0) {
      isPanning.value = true
      panStartX.value = event.evt.clientX
      panStartY.value = event.evt.clientY
      panPrevX.value = event.evt.clientX
      panPrevY.value = event.evt.clientY
      panThresholdMet.value = false
      const windowMouseUpHandler = () => {
        isPanning.value = false
        panThresholdMet.value = false
        if (spacePressed.value) {
          currentCursorMode.value = 'grab'
        } else {
          currentCursorMode.value = 'default'
        }
        window.removeEventListener('mouseup', windowMouseUpHandler)
      }
      window.addEventListener('mouseup', windowMouseUpHandler)
      return
    }

    host.emit('stage:mousedown', {
      point,
      ...event,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)

    const stage = event.target.getStage()
    if (stage) {
      const pointerPos = stage.getPointerPosition()
      if (pointerPos) {
        mouseStageX.value = pointerPos.x
        mouseStageY.value = pointerPos.y
      }
    }

    if (isPanning.value) {
      const dx = event.evt.clientX - panPrevX.value
      const dy = event.evt.clientY - panPrevY.value

      if (!panThresholdMet.value) {
        const totalDx = event.evt.clientX - panStartX.value
        const totalDy = event.evt.clientY - panStartY.value
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) >= PAN_THRESHOLD) {
          panThresholdMet.value = true
          currentCursorMode.value = 'grabbing'
        }
      }

      if (panThresholdMet.value) {
        handlePanByPixels(dx, dy)
      }

      panPrevX.value = event.evt.clientX
      panPrevY.value = event.evt.clientY
      return
    }

    host.emit('stage:mousemove', {
      point,
      ...event,
      source: 'use-stage-event',
      timestamp: Date.now(),
    })
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)

    if (isPanning.value) {
      isPanning.value = false
      panThresholdMet.value = false
      if (spacePressed.value) {
        currentCursorMode.value = 'grab'
      } else {
        currentCursorMode.value = 'default'
      }
      return
    }

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

  function handleKeyDown(event: any) {
    // 方向键在画布聚焦时用于移动选中元素，阻止浏览器默认滚动行为
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault()
    }
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
      host.emit('stage:keydown-up', { evt: event, source: 'use-stage-event', timestamp: Date.now() })
    } else if (event.code == 'ArrowDown') {
      host.emit('stage:keydown-down', {
        evt: event,
        source: 'use-stage-event',
        timestamp: Date.now(),
      })
    }
  }

  function handleMouseenter(event: any) {
    host.emit('stage:mouseenter', { ...event, source: 'use-stage-event', timestamp: Date.now() })
  }

  function handleMouseleave(event: any) {
    host.emit('stage:mouseleave', { ...event, source: 'use-stage-event', timestamp: Date.now() })
  }

  function handleContextmenu(event: any) {
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

  function getEventElement(event: any): {
    element: IGraphicElement | null
    elementId: string | null
  } {
    try {
      const elementsPlugin = host.getPlugin('element-manager-plugin')
      let node = event.target

      while (node) {
        const elementId = node.attrs?.id

        if (elementId && elementsPlugin?.elements.has(elementId)) {
          return {
            element: elementsPlugin.getElement(elementId),
            elementId,
          }
        }

        if (node === event.currentTarget) break
        node = node.getParent?.()
      }
    } catch {
      // 非元素节点（如背景、未安装插件等情况）时静默返回 null
    }

    return {
      element: null,
      elementId: null,
    }
  }

  return {
    stageWrapperRef,
    transformOrigin,
    hostState,
    handleClick,
    handleDblClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    handleMouseenter,
    handleMouseleave,
    handleContextmenu,
    handleSpaceDown,
    handleSpaceUp,
    isPanning,
    panThresholdMet,
  }
}
