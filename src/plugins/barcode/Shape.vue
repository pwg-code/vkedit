<template>
  <v-image
    v-if="image"
    :config="{
      ...element.config,
      image: image,
    }"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { BarcodeElement } from './barcode'
// @ts-ignore
import JsBarcode from 'jsbarcode'
import type { EditorHost } from '@/core'
import { useImage } from 'vue-konva'

interface Props {
  host: EditorHost
  element: BarcodeElement
}

const { host, element } = defineProps<Props>()
const image = ref()

const renderBarcode = async () => {
  const heightPx = Math.max(1, Math.round(element.height))
  const canvas = document.createElement('canvas')
  try {
    // width option controls bar width; keep it small to fit
    JsBarcode(canvas, element.content ?? '', {
      format: (element.format as any) ?? 'CODE128',
      lineColor: element.foreground ?? '#000',
      background: element.background ?? '#fff',
      height: heightPx,
      displayValue: true,
    })
    image.value = canvas
  } catch (e) {
    // fallback: empty image
    image.value = undefined
    // eslint-disable-next-line no-console
    console.error('JsBarcode render error', e)
  }
}

onMounted(() => {
  renderBarcode()
})

watch(
  () => [element.content, element.format, element.foreground, element.background, element.width, element.height],
  renderBarcode,
)
</script>

<style scoped></style>
