<template>
  <v-group :config="groupConfig()">
    <v-image v-if="image" :config="imageConfig" />
    <v-text v-if="element.displayValue && image" :config="textConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { BarcodeElement } from './barcode'
// @ts-ignore
import type { EditorHost } from '@/core'

interface Props {
  host: EditorHost
  element: BarcodeElement
}

const { host, element } = defineProps<Props>()
const image = ref<HTMLCanvasElement>()

const renderBarcode = async () => {
  image.value = await element.renderBarcode()
}

onMounted(() => {
  renderBarcode()
})

watch(
  () => [
    element.content,
    element.format,
    element.foreground,
    element.background,
    element.barcodeWidthMM,
    element.barcodeHeightMM,
    element.displayValue,
    element.fontSizeMM,
    element.marginMM,
  ],
  renderBarcode,
)

// 整体变换配置：id 放在 group 上，供 transformer.findOne('#id') 与 selection 命中
// 使用普通函数而非 computed，因为 element 是非响应式类实例，computed 无法追踪其属性变化
const groupConfig = () => ({
  id: element.id,
  x: element.x,
  y: element.y,
  rotation: element.rotation,
  scaleX: element.scaleX,
  scaleY: element.scaleY,
  draggable: element.draggable,
  visible: element.visible,
})

// 条纹位图：相对 group 原点 (0,0) 放置，尺寸取 canvas 实际像素
const imageConfig = computed(() => ({
  image: image.value,
  width: image.value?.width ?? 0,
  height: image.value?.height ?? 0,
}))

// 矢量可读值文字：紧贴条纹下方，水平居中；listening:false 不拦截命中（命中由 group 承接）
const textConfig = computed(() => ({
  text: element.content,
  fontSize: element.fontSize,
  fontFamily: 'OCR-B',
  fontStyle: 'bold',
  fill: element.foreground,
  align: 'center',
  width: image.value?.width ?? 0,
  x: 0,
  y: element.barcodeHeight + element.margin,
  listening: false,
}))
</script>

<style scoped></style>
