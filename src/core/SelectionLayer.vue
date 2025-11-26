<template>
  <!-- <v-layer :config="selectionLayerConfig"> -->
  <!-- <v-group> -->
  <v-rect v-if="isSelecting" :config="rectConfig" />
  <!-- 为每个已选中的元素绘制凸显边框 -->
  <v-rect v-for="border in selectionBorders" :key="border.id" :config="border.config" />
  <!-- </v-group> -->
  <!-- </v-layer> -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { type EditorHost } from '@/core'
import { useSelectionLayer } from '@/hooks/use-selection-layer'
import type { IGraphicElement } from '@/types'

const { host } = defineProps<{ host: EditorHost }>()
const {
  rectConfig,
  isSelecting,
  selectionLayerConfig,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handlePMouseleave,
} = useSelectionLayer(host)

// 选中的元素列表
const selectedElements = ref<IGraphicElement[]>([])

// 为选中元素生成边框配置
const selectionBorders = computed(() => {
  return selectedElements.value.map((element) => {
    const bbox = element.getBoundingBox()
    // 获取元素在画布上的实际位置
    const shape = host.contentLayer?.getNode().findOne('#' + element.id)
    const absPos = shape?.getAbsolutePosition() || { x: bbox.x, y: bbox.y }
    const zoom = host.status.zoom

    return {
      id: element.id,
      config: {
        x: absPos.x,
        y: absPos.y,
        width: bbox.width * zoom,
        height: bbox.height * zoom,
        fill: 'transparent',
        stroke: '#3498db',
        strokeWidth: 2,
        dash: [5, 5],
        listening: false,
        // 确保边框显示在元素上方
        opacity: 1,
      },
    }
  })
})

// 监听选中元素的变化
const handleSelectionChanged = (event: any) => {
  selectedElements.value = event.selection || []
}

// 监听元素对齐事件，强制更新边框位置
const handleElementsAlign = (event: any) => {
  // 触发响应式更新，确保边框重新计算位置
  selectedElements.value = [...selectedElements.value]
}

onMounted(() => {
  host.on('stage:mousedown', handleMouseDown)
  host.on('stage:mousemove', handleMouseMove)
  host.on('stage:mouseup', handleMouseUp)
  host.on('stage:mouseleave', handlePMouseleave)
  host.on('selection:changed', handleSelectionChanged)
  host.on('elements:align', handleElementsAlign)
})
</script>
