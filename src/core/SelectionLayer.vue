<template>
  <!-- <v-layer :config="selectionLayerConfig"> -->
  <!-- <v-group> -->
  <v-rect v-if="isSelecting" :config="rectConfig" />
  <!-- 为每个已选中的元素绘制凸显边框（策略 A：单选且 Transformer 可见时不绘制） -->
  <v-rect v-for="border in selectionBorders" :key="border.id" :config="border.config" />
  <!-- </v-group> -->
  <!-- </v-layer> -->
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { type EditorHost } from '@/core'
import { useSelectionLayer } from '@/hooks/use-selection-layer'
import { useZoom } from '@/hooks/use-zoom'
import { cssColorVar } from '@/utils/css-var'
import type { IGraphicElement } from '@/types'

const { host } = defineProps<{ host: EditorHost }>()
const {
  rectConfig,
  isSelecting,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseLeave,
} = useSelectionLayer(host)

// 选中的元素列表
const selectedElements = ref<IGraphicElement[]>([])

// 视口平移/缩放偏移（响应式），确保空格+拖动平移时边框跟随元素
const { contentX, contentY, zoom } = useZoom(host)

// 为选中元素生成边框配置
// 策略 A：单选且可变换 → 仅保留 Transformer；多选 / 不可变换 → SelectionLayer 边框
const selectionBorders = computed(() => {
  const elements = selectedElements.value
  if (elements.length === 0) return []

  const onlyTransformer =
    elements.length === 1 && elements[0].resizable !== false
  if (onlyTransformer) return []

  const cx = contentX.value
  const cy = contentY.value
  const z = zoom.value
  const stroke = cssColorVar('--vkedit-color-primary', host.stageState.wrapperEl)

  return elements.map((element) => {
    const bbox = element.getBoundingBox()
    return {
      id: element.id,
      config: {
        x: cx + bbox.x * z,
        y: cy + bbox.y * z,
        width: bbox.width * z,
        height: bbox.height * z,
        fill: 'transparent',
        stroke,
        strokeWidth: 1.5,
        listening: false,
        rotation: element.rotation,
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
const handleElementsAlign = () => {
  selectedElements.value = [...selectedElements.value]
}

// 监听元素变换/属性更新（拖动、缩放、旋转、属性面板修改、撤销/重做），
// 元素位置/尺寸属性为非响应式类属性，需强制刷新使边框重新计算
const handleElementUpdated = () => {
  selectedElements.value = [...selectedElements.value]
}

onMounted(() => {
  host.on('stage:mousedown', handleMouseDown)
  host.on('stage:mousemove', handleMouseMove)
  host.on('stage:mouseup', handleMouseUp)
  host.on('stage:mouseleave', handleMouseLeave)
  host.on('selection:changed', handleSelectionChanged)
  host.on('elements:align', handleElementsAlign)
  host.on('elements:distribute', handleElementsAlign)
  host.on('element:updated', handleElementUpdated)
})
</script>
