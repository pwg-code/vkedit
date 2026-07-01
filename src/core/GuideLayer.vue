<template>
  <v-line
    v-for="(line, idx) in screenLines"
    :key="idx"
    :config="line"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EditorHost } from '@/core'
import { useZoom, useStage } from '@/hooks'
import type { GuideLine } from '@/utils/geometry'

const { host } = defineProps<{ host: EditorHost }>()

const { contentX, contentY, zoom } = useZoom(host)
const { width, height } = useStage(host)

const snapPlugin = computed(() => {
  try {
    return host.getPlugin('snap-plugin') as unknown as { guideLines: { value: GuideLine[] } } | null
  } catch {
    return null
  }
})

const guideLines = computed<GuideLine[]>(() => snapPlugin.value?.guideLines.value ?? [])

const screenLines = computed(() => {
  const cx = contentX.value
  const cy = contentY.value
  const z = zoom.value
  const w = width.value
  const h = height.value
  return guideLines.value.map((line) => {
    if (line.axis === 'x') {
      const sx = cx + line.value * z
      return {
        points: [sx, 0, sx, h],
        stroke: '#00b894',
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.8,
        listening: false,
      }
    } else {
      const sy = cy + line.value * z
      return {
        points: [0, sy, w, sy],
        stroke: '#00b894',
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.8,
        listening: false,
      }
    }
  })
})
</script>

<style scoped></style>
