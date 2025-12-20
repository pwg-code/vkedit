<template>
  <v-image
    v-if="image"
    :config="{
      ...element.config,
      image: image,
      width: image.width,
      height: image.height,
    }"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
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
</script>

<style scoped></style>
