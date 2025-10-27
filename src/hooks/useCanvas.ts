import type { ElementsPlugin } from '@/plugins'
import type { IEditorHost, IEditorState, IGraphicElement, Point2D } from '@/types'
import { EditorEvents } from '@/types/EventTypes'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

export default function (host: IEditorHost) {
  // 画布状态
  const hostState = ref<IEditorState>(host.getState())

  const stageRef = ref<any>(null)
  const canvasWrapperRef = ref<HTMLElement | null>(null) // 画布div ref对象
  const layerRef = ref() // 画布图层 ref对象
  const scrollContainer = ref<HTMLElement | null>(null)
  const transformOrigin = ref({ x: 0, y: 0 })

  const { width, height } = useElementSize(canvasWrapperRef)

  // 内容图层配置
  const layerConfig = reactive({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    fill: '6666',
  })

  // 舞台配置
  const stageConfig = computed(() => ({
    width: width.value,
    height: height.value,
    scaleX: 1,
    scaleY: 1,
  }))

  // 所有的图像元素
  const elements = ref<IGraphicElement[]>([])
  const initElements = () => {
    const a = host.getPlugin<ElementsPlugin>('elements')?.elements.values()
    if (a) {
      elements.value = Array.from(a)
    }
  }

  const isSelecting = ref(false)
  const selectionStart = ref<Point2D>({ x: 0, y: 0 })
  const selectionEnd = ref<Point2D>({ x: 0, y: 0 })
  const gridLines = computed(() => {
    if (!host.getState().showGrid) return []

    // 生成网格线
    const lines = []
    const gridSize = 20
    const width = stageConfig.value.width
    const height = stageConfig.value.height

    for (let x = 0; x <= width; x += gridSize) {
      lines.push({
        points: [x, 0, x, height],
        stroke: '#e0e0e0',
        strokeWidth: 1,
      })
    }

    for (let y = 0; y <= height; y += gridSize) {
      lines.push({
        points: [0, y, width, y],
        stroke: '#e0e0e0',
        strokeWidth: 1,
      })
    }

    return lines
  })

  // 鼠标按下
  const handleClick = (event: any) => {
    const point = getEventPoint(event)
    host.emit(EditorEvents.CANVAS_CLICK, { point, ...event })
  }

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousedown', { point, ...event })
    if (host.getState().currentTool === 'select') {
      isSelecting.value = true
      selectionStart.value = point
      selectionEnd.value = point
    }
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousemove', { point, ...event })
    if (isSelecting.value) {
      selectionEnd.value = point
    }
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mouseup', { point, ...event })
    isSelecting.value = false
  }

  function handleWheel(e: WheelEvent) {
    if (!canvasWrapperRef.value || !scrollContainer.value) return

    e.preventDefault()

    const rect = canvasWrapperRef.value.getBoundingClientRect()
    const containerRect = scrollContainer.value.getBoundingClientRect()

    const pointerX = e.clientX - containerRect.left
    const pointerY = e.clientY - containerRect.top

    transformOrigin.value = { x: pointerX, y: pointerY }

    const delta = e.deltaY
    const zoomFactor = 0.05
    const newScale = hostState.value.zoom - (delta * zoomFactor) / 100

    hostState.value.zoom = Math.min(Math.max(newScale, 0.2), 3)
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

  onMounted(() => {
    // 添加或删除图形时触发更新elements
    host.on('element:removed', initElements)
    host.on('element:added', initElements)
  })

  return {
    canvasWrapperRef,
    transformOrigin,
    layerRef,
    stageRef,
    stageConfig,
    hostState,
    elements,
    isSelecting,
    selectionStart,
    selectionEnd,
    gridLines,
    handleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    initElements,
    layerConfig,
    height,
    width,
  }
}
