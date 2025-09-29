<template>
  <v-group
    :config="groupConfig"
    @mousedown="handleMouseDown"
    @touchstart="handleMouseDown"
    @transformend="handleTransformEnd"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    ref="groupRef"
  >
    <!-- 具体图形由子组件实现 -->
    <slot></slot>

    <!-- 选中状态 -->
  </v-group>
  <v-transformer
    v-if="selected && !element.locked"
    ref="transformerRef"
    @transform="handleSelectionTransform"
  ></v-transformer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { IGraphicElement, Point2D } from '../types'
import SelectionOverlay from '../core/SelectionOverlay.vue'

// 转换器
const transformerRef = ref()
// 组
const groupRef = ref()

interface Props {
  element: IGraphicElement
  selected: boolean
}

interface Emits {
  (e: 'select', elementId: string): void
  (e: 'transform', elementId: string, transforms: any): void
  (e: 'dragStart', elementId: string): void
  (e: 'dragEnd', elementId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const groupConfig = computed(() => ({
  x: props.element.x,
  y: props.element.y,
  rotation: props.element.rotation,
  scaleX: props.element.scaleX,
  scaleY: props.element.scaleY,
  visible: props.element.visible,
  draggable: !props.element.locked && props.selected,
  name: `graphic-${props.element.id}`,
}))

const handleMouseDown = (event: any) => {
  // event.cancelBubble = true
  if (props.element.locked) return
  emit('select', props.element.id)
}

const handleTransformEnd = (event: any) => {
  const node = event.target
  const transforms = {
    x: node.x(),
    y: node.y(),
    rotation: node.rotation(),
    scaleX: node.scaleX(),
    scaleY: node.scaleY(),
  }
  emit('transform', props.element.id, transforms)
}

const handleDragStart = (event: any) => {
  emit('dragStart', props.element.id)
}

const handleDragEnd = (event: any) => {
  emit('dragEnd', props.element.id)
}

const handleSelectionTransform = (transforms: any) => {
  emit('transform', props.element.id, transforms)
}

// 将转换器附件到组
onMounted(() => {
  console.log(transformerRef.value)
  const transformerNode = transformerRef.value.getNode()
  transformerNode.nodes([groupRef.value.getNode()])
})
</script>
