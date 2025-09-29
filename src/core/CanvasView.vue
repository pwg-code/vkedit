<template>
  <div class="m-auto bg-white">
    <v-stage
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
    >
      <v-layer ref="layerRef">
        <!-- 网格 -->
        <v-line
          v-if="hostState.showGrid"
          v-for="(line, index) in gridLines"
          :key="`grid-${index}`"
          :config="line"
        />

        <!-- 渲染其他未选中的组件 -->
        <component
          v-for="element in elements"
          :key="element.id"
          :is="getElementComponent(element.type)"
          :element="element"
          @transformend="handleElementTransform($event, element)"
          @dragend="handleDragEnd($event, element)"
        />
        <v-transformer ref="transformerRef"></v-transformer>

        <!-- 选择框 -->
        <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'

import type { IEditorHost, IEditorState, IGraphicElement, Point2D } from '../types'
import SelectionRectangle from './SelectionRectangle.vue'
import SelectionOverlay from './SelectionOverlay.vue'
import useGraphicType from '@/hooks/useGraphicType'
import { EditorEvents } from '@/types/EventTypes'
import { TransformElementCommand, UpdatePropertyCommand } from '@/commands'

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()

// 画布状态
const hostState = ref<IEditorState>(props.host.getState())

const stageConfig = computed(() => ({
  width: hostState.value.width,
  height: hostState.value.height,
  scaleX: props.host.getState().zoom,
  scaleY: props.host.getState().zoom,
}))

// 主图层
const layerRef = ref()
// 转换器
const transformerRef = ref()

// 获取选中的图像的node
const getSelectedNodes = () => {
  const nodes: any[] = []
  if (layerRef.value) {
    hostState.value.selectedElementIds.forEach((id) => {
      nodes.push(layerRef.value.getNode().findOne('#' + id))
    })
  }
  return nodes
}

// 监控选中的nodes 动态附件变化器
const selectedNodes = computed(getSelectedNodes)
watch(selectedNodes, (value) => {
  const transformerNode = transformerRef.value.getNode()
  if (transformerNode) {
    transformerNode.nodes(value)
  }
})

// 所有的图像元素
const elements = ref<IGraphicElement[]>([])
const initElements = () => {
  elements.value = props.host.getElements()
}

const isSelecting = ref(false)
const selectionStart = ref<Point2D>({ x: 0, y: 0 })
const selectionEnd = ref<Point2D>({ x: 0, y: 0 })
const gridLines = computed(() => {
  if (!props.host.getState().showGrid) return []

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
const handleMouseDown = (event: any) => {
  const point = getEventPoint(event)
  props.host.emit('canvas:mousedown', point)
  if (props.host.getState().currentTool === 'select') {
    isSelecting.value = true
    selectionStart.value = point
    selectionEnd.value = point
  }
}

const handleMouseMove = (event: any) => {
  const point = getEventPoint(event)
  props.host.emit('canvas:mousemove', point)
  if (isSelecting.value) {
    selectionEnd.value = point
  }
}

const handleMouseUp = (event: any) => {
  const point = getEventPoint(event)
  props.host.emit('canvas:mouseup', point)
  isSelecting.value = false
}

const handleWheel = (event: any) => {
  event.evt.preventDefault()
  const scaleBy = 1.1
  const stage = event.target.getStage()
  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()
  const mousePointTo = {
    x: pointer.x / oldScale - stage.x() / oldScale,
    y: pointer.y / oldScale - stage.y() / oldScale,
  }

  const newScale = event.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
  props.host.setState({
    zoom: newScale,
  })
}

// 图形变换更改属性
const handleElementTransform = (event: any, element: any) => {
  console.log('图形变换event', event)
  console.log('图形变换element', element)
  const eAttrs = event.target.attrs
  const newAttrs = { scaleX: eAttrs.scaleX, scaleY: eAttrs.scaleY }
  const oldAttrs = {}
  // 使用命令更改属性
  // props.host.emit(EditorEvents)
}

// 图形拖拽
const handleDragEnd = (event: any, element: any) => {
  const eAttrs = event.target.attrs
  const newAttrs = { x: eAttrs.x, y: eAttrs.y }
  const oldAttrs = { x: element.x, y: element.y }
  // 使用命令更改属性
  const command = new TransformElementCommand(element, props.host, oldAttrs, newAttrs)
  props.host.executeCommand(command)
}

const getEventPoint = (event: any): Point2D => {
  const stage = event.target.getStage()
  const point = stage.getPointerPosition()
  return {
    x: point.x / props.host.getState().zoom,
    y: point.y / props.host.getState().zoom,
  }
}

const { getElementComponent } = useGraphicType(props.host)

onMounted(() => {
  // 添加或删除图形时触发更新elements
  props.host.on('element:removed', initElements)
  props.host.on('element:added', initElements)
})
</script>

<style scoped></style>
