<template>
  <div class="flex-1 w-full bg-gray-200" ref="canvasRef" tabindex="0" @keydown="handleKeyDown">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
      @click="handleClick"
    >
      <v-layer ref="contentLayer" :config="contentLayerConfig">
        <!-- 背景 -->
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: stageConfig.width,
            height: stageConfig.height,
            fill: '#e5e7eb',
          }"
        ></v-rect>
        <!-- 上标尺 -->
        <v-rect
          :config="{ x: 0, y: 0, width: stageConfig.width, height: 10, fill: '#6666' }"
        ></v-rect>

        <!-- 左标尺 -->
        <v-rect
          :config="{ x: 0, y: 0, width: 10, height: stageConfig.height, fill: '#6666' }"
        ></v-rect>

        <!-- 内容区底板 -->
        <v-rect
          :config="{
            x: contentX,
            y: contentY,
            width: contentWidth,
            height: contentHeight,
            fill: '#fff',
          }"
        ></v-rect>

        <!-- 图形区域 -->
        <v-group
          :config="{
            x: contentX,
            y: contentY,
            width: contentWidth,
            height: contentHeight,
            scaleX: hostState.zoom,
            scaleY: hostState.zoom,
          }"
        >
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
            :is="graphicTypesPlugin?.getElementComponent(element.type)"
            :element="element"
            :host="host"
            @transform="handleElementTransform($event, element)"
            @transformend="handleElementTransformEnd($event, element)"
            @dragend="handleDragEnd($event, element)"
          />
          <v-transformer ref="transformerRef" :config="{}"></v-transformer>
        </v-group>
        <!-- <v-transformer
                ref="transformerRef"
                :config="{ enabledAnchors: ['bottom-right'] }"
              ></v-transformer> -->

        <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
        <!-- 放大缩小按钮 -->
      </v-layer>
    </v-stage>
    <div
      class="fixed flex items-center"
      :style="{
        top: stageConfig.height + 'px',
        left: stageConfig.width - 50 + 'px',
      }"
    >
      <button
        class="hover:bg-background rounded-xl active:bg-secondary p-2"
        @click="handleZoomIn()"
      >
        <Icon icon="material-symbols-light:zoom-in-rounded" :width="30"></Icon>
      </button>
      <div class="w-10 flex-1 text-center">{{ hostState.zoom.toFixed(1) }}</div>
      <button
        class="hover:bg-background rounded-xl active:bg-secondary p-2"
        @click="handleZoomOut()"
      >
        <Icon icon="material-symbols-light:zoom-out" :width="30"></Icon>
      </button>
      <button
        class="hover:bg-background rounded-xl active:bg-secondary p-2"
        @click="handleZoomAuto()"
      >
        <Icon icon="material-symbols-light:zoom-out-map" :width="30"></Icon>
      </button>
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

import type { IEditorHost, IEditorPlugin, IEditorState, IGraphicElement, Point2D } from '../types'
import SelectionRectangle from './SelectionRectangle.vue'
import { EditorEvents } from '@/types/EventTypes'
import { TransformElementCommand, UpdatePropertyCommand } from '@/commands'
import useCanvas from '@/hooks/useCanvas'
import type { GraphicTypesPlugin } from '@/plugins'
import useZoom from '@/hooks/useZoom'

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()

const {
  canvasRef,
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
  handleKeyDown,
  initElements,
  contentLayer,
  contentLayerConfig,
  rulerLeftLayer,
  rulerTopLayer,
  rulerLeftLayerConfig,
  rulerTopLayerConfig,
} = useCanvas(props.host)

const {
  contentHeight,
  contentWidth,
  contentX,
  contentY,
  handleZoomIn,
  handleZoomOut,
  handleZoomAuto,
} = useZoom(stageConfig, hostState)

watch(contentHeight, (v) => {
  console.log(v)
})

// 转换器
const transformerRef = ref()

// 更新选中元素
const updateTransformerNodes = (selection: Map<string, IGraphicElement>) => {
  const nodes: any[] = []
  if (!contentLayer.value) return
  selection.forEach((e) => {
    const node = contentLayer.value.getNode().findOne('#' + e.id)
    if (node) {
      nodes.push(node)
    } else {
      console.warn('找不到节点', e.id)
    }
  })

  const transformerNode = transformerRef.value.getNode()
  if (transformerNode) {
    transformerNode.nodes(nodes)
  }
}

let command: TransformElementCommand
let isTransforming = false

// 图形变换更改属性
const handleElementTransform = (event: any, element: any) => {
  // 如果图形元素没有提供getTransformAttr则使用默认
  const graphicType = graphicTypesPlugin?.getGraphicType(element.type)
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

// const { getElementComponent, getGraphicType } = useGraphicType(props.host)
const graphicTypesPlugin = props.host.getPlugin<GraphicTypesPlugin>('graphic-types')

// 更新画布
function updateCanvas() {
  elements.value = [...elements.value]
}

onMounted(() => {
  // 选中变更事件
  props.host.on(EditorEvents.SELECTION_CHANGED, updateTransformerNodes)
  props.host.on(EditorEvents.ELEMENT_TRANSFORMED, initElements)
  props.host.on(EditorEvents.ELEMENT_UPDATED, updateCanvas)
  props.host.on(EditorEvents.PROPERTY_VALUE_CHANGE, updateCanvas)
  props.host.on(EditorEvents.ELEMENTS_ALIGN, updateCanvas)

  // 将内容图层赋值给宿主  以便其他插件使用
  props.host.contentLayer = contentLayer.value
})
</script>

<style scoped></style>
