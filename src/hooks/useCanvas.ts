import type { IEditorHost, IEditorState, IGraphicElement, Point2D } from '@/types'
import { EditorEvents } from '@/types/EventTypes'
import { computed, onMounted, reactive, ref } from 'vue'

export default function (host: IEditorHost) {
  // 画布状态
  const hostState = ref<IEditorState>(host.getState())

  const stageConfig = computed(() => ({
    width: hostState.value.width,
    height: hostState.value.height,

    x: stagePosition.x,
    y: stagePosition.y,
  }))

  // 所有的图像元素
  const elements = ref<IGraphicElement[]>([])
  const initElements = () => {
    elements.value = host.getElements()
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
    host.emit(EditorEvents.CANVAS_CLICK, point)
  }

  // 鼠标按下
  const handleMouseDown = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousedown', point)
    if (host.getState().currentTool === 'select') {
      isSelecting.value = true
      selectionStart.value = point
      selectionEnd.value = point
    }
  }

  const handleMouseMove = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mousemove', point)
    if (isSelecting.value) {
      selectionEnd.value = point
    }
  }

  const handleMouseUp = (event: any) => {
    const point = getEventPoint(event)
    host.emit('canvas:mouseup', point)
    isSelecting.value = false
  }

  const stageRef = ref<any>(null)
  const stagePosition = reactive({ x: 0, y: 0 })
  const canvasRef = ref<HTMLElement | null>(null)
  const scrollContainer = ref<HTMLElement | null>(null)
  const transformOrigin = ref({ x: 0, y: 0 })

  function handleWheel(e: WheelEvent) {
    if (!canvasRef.value || !scrollContainer.value) return

    e.preventDefault()

    const rect = canvasRef.value.getBoundingClientRect()
    const containerRect = scrollContainer.value.getBoundingClientRect()

    const pointerX = e.clientX - containerRect.left
    const pointerY = e.clientY - containerRect.top

    transformOrigin.value = { x: pointerX, y: pointerY }

    const delta = e.deltaY
    const zoomFactor = 0.05
    const newScale = hostState.value.zoom - (delta * zoomFactor) / 100

    hostState.value.zoom = Math.min(Math.max(newScale, 0.2), 3)
  }

  // function handleWheel(e: any) {
  //   e.evt.preventDefault()

  //   const stage = stageRef.value.getNode()
  //   const oldScale = hostState.value.zoom

  //   const pointer = stage.getPointerPosition()
  //   if (!pointer) return

  //   const scaleBy = 1.05
  //   const direction = e.evt.deltaY > 0 ? -1 : 1
  //   const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

  //   // 限制缩放范围
  //   hostState.value.zoom = Math.min(Math.max(newScale, 0.6), 3)
  //   const mousePointTo = {
  //     x: (pointer.x - stage.x()) / oldScale,
  //     y: (pointer.y - stage.y()) / oldScale,
  //   }

  //   stagePosition.x = pointer.x - mousePointTo.x * hostState.value.zoom
  //   stagePosition.y = pointer.y - mousePointTo.y * hostState.value.zoom
  // }

  const getEventPoint = (event: any): Point2D => {
    const stage = event.target.getStage()
    const point = stage.getPointerPosition()
    return {
      x: point.x / host.getState().zoom,
      y: point.y / host.getState().zoom,
    }
  }

  onMounted(() => {
    // 添加或删除图形时触发更新elements
    host.on('element:removed', initElements)
    host.on('element:added', initElements)
  })

  return {
    transformOrigin,
    canvasRef,
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
    initElements,
  }
}
