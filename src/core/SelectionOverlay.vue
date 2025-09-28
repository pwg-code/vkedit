<template>
  <!-- 选中框 -->
  <v-rect :config="selectionConfig" name="selection-overlay" />
  <!-- 变换控制点 -->
  <v-circle
    v-for="(anchor, index) in transformAnchors"
    :key="`anchor-${index}`"
    :config="anchor"
    @mousedown="handleAnchorMouseDown(index, $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IGraphicElement } from '../types'
interface Props {
  element: IGraphicElement
}
interface Emits {
  (e: 'transform', transforms: any): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const selectionConfig = computed(() => {
  const padding = 4
  const bbox = props.element.getBoundingBox()
  return {
    x: -padding,
    y: -padding,
    width: bbox.width + padding * 2,
    height: bbox.height + padding * 2,
    stroke: '#3498db',
    strokeWidth: 1,
    dash: [4, 4],
    listening: false,
  }
})

const transformAnchors = computed(() => {
  const bbox = props.element.getBoundingBox()
  const anchors: any[] = []
  const size = 6

  // 控制点定义...
  // 与之前类似的实现
  return anchors
})

const handleAnchorMouseDown = (anchorIndex: number, event: any) => {
  event.cancelBubble = true
  // 处理控制点拖拽逻辑
}
</script>
