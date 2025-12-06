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
import { ref, watch, onMounted, computed } from 'vue'
import type { QrElement } from './qr'
import QRCode from 'qrcode'
import type { EditorHost } from '@/core'
import { useImage } from 'vue-konva'

interface Props {
  host: EditorHost
  element: QrElement
}

const { host, element } = defineProps<Props>()
const image = ref()

const renderQr = async () => {
  const sizePx = Math.max(1, Math.round(element.width))
  const opts = {
    color: {
      dark: element.foreground ?? '#000',
      light: element.background ?? '#fff',
    },
    width: sizePx,
  }
  image.value = await QRCode.toCanvas(element.content ?? '', opts)
}

onMounted(() => {
  renderQr()
})

watch(
  () => [element.content, element.foreground, element.background, element.width, element.height],
  renderQr,
)
</script>

<style scoped></style>
