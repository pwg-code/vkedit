<template>
  <v-group v-if="overlay.visible" :config="groupConfig">
    <v-rect v-if="overlay.border" :config="borderConfig" />
    <v-line v-if="overlay.rotateStem" :config="stemConfig" />
    <v-rect
      v-for="a in overlay.anchors"
      :key="a.id"
      :config="anchorConfig(a)"
    />
    <v-circle v-if="overlay.rotateHandle" :config="rotateConfig" />
  </v-group>
  <RotateAngleLabel :angleLabel="angleLabel" />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { type EditorHost } from '@/core'
import { useTransformOverlay, type OverlayAnchorView } from '@/hooks/use-transform-overlay'
import { cssColorVar } from '@/utils/css-var'
import RotateAngleLabel from './RotateAngleLabel.vue'

const props = defineProps<{ host: EditorHost }>()

const { overlay, cursor, onOverlayPointerDown, angleLabel } = useTransformOverlay(props.host)

const groupConfig = computed(() => ({
  name: 'transform-overlay',
  id: 'transform-overlay',
  listening: true,
  onMousedown: onOverlayPointerDown,
}))

watchEffect(() => {
  const el = props.host.stageState.wrapperEl
  if (el) el.style.cursor = cursor.value
})

const borderConfig = computed(() => {
  const b = overlay.value.border!
  return {
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
    rotation: b.rotation,
    fill: 'transparent',
    stroke: b.stroke,
    strokeWidth: b.strokeWidth,
    listening: true,
    name: 'transform-overlay-border',
  }
})

const stemConfig = computed(() => {
  const s = overlay.value.rotateStem!
  return {
    points: s.points,
    stroke: s.stroke,
    strokeWidth: s.strokeWidth,
    listening: false,
    lineCap: 'round' as const,
  }
})

const anchorFill = computed(() =>
  cssColorVar('--vkedit-color-surface-solid', props.host.stageState.wrapperEl) || '#fff'
)

const anchorConfig = (a: OverlayAnchorView) => ({
  x: a.x - a.size / 2,
  y: a.y - a.size / 2,
  width: a.size,
  height: a.size,
  fill: anchorFill.value,
  stroke: overlay.value.border?.stroke || '#000',
  strokeWidth: 1.5,
  cornerRadius: 1,
  listening: true,
  name: `transform-overlay-anchor-${a.id}`,
})

const rotateConfig = computed(() => {
  const r = overlay.value.rotateHandle!
  return {
    x: r.x,
    y: r.y,
    radius: r.radius,
    fill: '#fff',
    stroke: overlay.value.border?.stroke || '#000',
    strokeWidth: 1.5,
    listening: true,
    name: 'transform-overlay-rotate',
  }
})
</script>

