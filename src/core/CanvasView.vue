<template>
  <div class="m-auto bg-white">
    <v-stage
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
    >
      <v-layer>
        <!-- 网格 -->
        <v-line
          v-if="host.getState().showGrid"
          v-for="(line, index) in gridLines"
          :key="`grid-${index}`"
          :config="line"
        />

        <!-- 动态渲染图形组件 -->

        <component
          v-for="element in elements"
          :key="element.id"
          :is="getElementComponent(element)"
          :element="element"
          :selected="isSelected(element.id)"
          @select="handleElementSelect"
          @transform="handleElementTransform"
        />

        <!-- 选择框 -->
        <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { IEditorHost, IGraphicElement, Point2D } from '../types'
import SelectionRectangle from './SelectionRectangle.vue'

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()
const stageConfig = computed(() => ({
  width: 800,
  height: 600,
  scaleX: props.host.getState().zoom,
  scaleY: props.host.getState().zoom,
}))

const elements = computed(() => {
  // 从host获取所有元素
  return props.host.getElements()
})

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

const isSelected = (elementId: string) => {
  return props.host.getState().selectedElementIds.includes(elementId)
}

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

const handleElementSelect = (elementId: string) => {
  // 处理元素选择
}

// 图形变换更改属性
const handleElementTransform = (e: any) => {}

const getEventPoint = (event: any): Point2D => {
  const stage = event.target.getStage()
  const point = stage.getPointerPosition()

  return {
    x: point.x / props.host.getState().zoom,
    y: point.y / props.host.getState().zoom,
  }
}

// 图形类型注册表
const graphicTypes = ref(new Map<string, any>())

// 注册图形类型
const registerGraphicType = (type: any) => {
  console.log('注册图形类型', type)

  graphicTypes.value.set(type.type, type.component)
}

// 获取元素的Vue组件
const getElementComponent = (element: IGraphicElement) => {
  return graphicTypes.value.get(element.type) || 'div'
}

onMounted(() => {
  // 监听图形类型注册事件
  props.host.on('graphic-type:registered', registerGraphicType)
  // 从已注册插件加载图形类型
  // 这里需要遍历所有插件并调用registerGraphicTypes方法
})
</script>

<style scoped></style>
