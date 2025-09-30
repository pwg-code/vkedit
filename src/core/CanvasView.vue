<template>
  <div
    class="min-w-[2000px] min-h-[2000px] bg-gray-400 flex items-center justify-center"
    ref="parentRef"
    :style="{
      transform: `scale(${hostState.zoom})`,
      transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
    }"
  >
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
        <!-- <v-rect
          :config="{
            x: hostState.width / 2 - 800,
            y: hostState.height / 2 - 800,
            width: 800,
            height: 800,
            fill: '#ffff',
          }"
        >
        </v-rect> -->
        <!-- 渲染其他未选中的组件 -->
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

        <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
      </v-layer>
    </v-stage>
  </div>
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
  }
}

// 图形变换更改属性
const handleElementTransform = (event: any, element: any) => {
  const { newAttrs, oldAttrs } = getTransformAttr(event, element)
  // 使用命令更改属性
  const command = new TransformElementCommand(element, props.host, newAttrs, oldAttrs)
  command.execute() // 直接执行 避免多次入栈
}

// 图形变换更改属性
const handleElementTransformEnd = (event: any, element: any) => {
  // const { newAttrs, oldAttrs } = getTransformAttr(event, element)
  // // 使用命令更改属性
  // const command = new TransformElementCommand(element, props.host, oldAttrs, newAttrs)
  // props.host.executeCommand(command)
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
  const oldAttrs = { width: element.width, height: element.height, scaleX: 1, scaleY: 1 }
  const newAttrs = {
    width: element.width * eAttrs.scaleX,
    height: element.height * eAttrs.scaleY,
    scaleX: 1,
    scaleY: 1,
  }
  return { newAttrs, oldAttrs }
}

const { getElementComponent } = useGraphicType(props.host)

onMounted(() => {
  // 选中变更事件
  props.host.on(EditorEvents.SELECTION_CHANGED, updateTransformerNodes)
})
</script>

<style scoped></style>
