<template>
  <!-- <div
    class="min-w-[2000px] min-h-[2000px] bg-gray-400 flex items-center justify-center"
    ref="parentRef"
    :style="{
      transform: `scale(${hostState.zoom})`,
      transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
    }"
  > -->
  <!-- <div class="bg-gray-400 flex items-center justify-center" ref="parentRef"> -->
  <v-stage
    ref="stageRef"
    :config="stageConfig"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel="handleWheel"
    @click="handleClick"
  >
    <v-layer ref="layerRef">
      <!-- 网格 -->
      <v-line
        v-if="hostState.showGrid"
        v-for="(line, index) in gridLines"
        :key="`grid-${index}`"
        :config="line"
      />
      <component
        v-for="element in elements"
        :key="element.id"
        :is="getElementComponent(element.type)"
        :element="element"
        @transform="handleElementTransform($event, element)"
        @transformend="handleElementTransformEnd($event, element)"
        @dragend="handleDragEnd($event, element)"
      />
      <v-transformer ref="transformerRef" :config="{}"></v-transformer>
      <!-- <v-transformer
        ref="transformerRef"
        :config="{ enabledAnchors: ['bottom-right'] }"
      ></v-transformer> -->

      <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
    </v-layer>
  </v-stage>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'

import type { IEditorHost, IEditorPlugin, IEditorState, IGraphicElement, Point2D } from '../types'
import SelectionRectangle from './SelectionRectangle.vue'
// import SelectionOverlay from './SelectionOverlay.vue'
import useGraphicType from '@/hooks/useGraphicType'
import { EditorEvents } from '@/types/EventTypes'
import { TransformElementCommand, UpdatePropertyCommand } from '@/commands'
import useCanvas from '@/hooks/useCanvas'
const parentRef = ref<HTMLElement | null>(null)

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()
const {
  transformOrigin,
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
} = useCanvas(props.host)

// 主图层
const layerRef = ref()
// 转换器
const transformerRef = ref()

// 更新选中元素
const updateTransformerNodes = (selection: Set<string>) => {
  const nodes: any[] = []
  if (layerRef.value) {
    selection.forEach((id) => {
      nodes.push(layerRef.value.getNode().findOne('#' + id))
    })
  }
  const transformerNode = transformerRef.value.getNode()
  if (transformerNode) {
    transformerNode.nodes(nodes)
    console.log('updateTransformerNodes', nodes, selection)
  }
}

let command: TransformElementCommand
let isTransforming = false

// 图形变换更改属性
const handleElementTransform = (event: any, element: any) => {
  // 如果图形元素没有提供getTransformAttr则使用默认
  const graphicType = getGraphicType(element.type)
  if (graphicType?.getTransformAttr) {
    const { oldAttrs, newAttrs } = graphicType.getTransformAttr(event, element)
    command = new TransformElementCommand(element, props.host, oldAttrs, newAttrs)
  } else {
    const { oldAttrs, newAttrs } = getTransformAttr(event, element)
    command = new TransformElementCommand(element, props.host, oldAttrs, newAttrs)
  }

  // 首次转换入栈
  if (!isTransforming) {
    isTransforming = true
    props.host.executeCommand(command)
  } else {
    // 中间态不入栈 直接更新属性
    command.execute()
  }
}

// 图形变换更改属性
const handleElementTransformEnd = (event: any, element: any) => {
  // 结束入栈
  props.host.executeCommand(command)
  isTransforming = false
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

// 获取转换的属性
const getTransformAttr = (event: any, element: any) => {
  const eAttrs = event.target.attrs
  const oldAttrs = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    scaleX: 1,
    scaleY: 1,
    rotation: element.rotation,
  }
  const newAttrs = {
    x: eAttrs.x,
    y: eAttrs.y,
    width: element.width * eAttrs.scaleX,
    height: element.height * eAttrs.scaleY,
    scaleX: 1,
    scaleY: 1,
    rotation: eAttrs.rotation,
  }
  return { oldAttrs, newAttrs }
}

const { getElementComponent, getGraphicType } = useGraphicType(props.host)

onMounted(() => {
  // 选中变更事件
  props.host.on(EditorEvents.SELECTION_CHANGED, updateTransformerNodes)
  props.host.on(EditorEvents.ELEMENT_TRANSFORMED, initElements)
})
</script>

<style scoped></style>
