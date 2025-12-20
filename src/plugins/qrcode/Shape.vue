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
import type { QrcodeElement } from './qrcode'
import type { EditorHost } from '@/core'
import { useImage } from 'vue-konva'

interface Props {
  host: EditorHost
  element: QrcodeElement
}

const { host, element } = defineProps<Props>()
const image = ref<HTMLCanvasElement>()

async function renderQr() {
  image.value = await element.renderQrcode()
}

onMounted(() => {
  renderQr()
})

watch(
  () => [
    element.content,
    element.foreground,
    element.background,
    element.width,
    element.height,
    element.marginMM,
  ],
  renderQr,
)
</script>

<style scoped></style>
