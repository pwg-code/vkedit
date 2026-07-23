<template>
  <v-group v-if="overlay.visible" :config="groupConfig" @mousedown="onOverlayPointerDown">
    <v-rect v-if="overlay.border" :config="borderConfig" />
    <v-line v-if="overlay.rotateStem" :config="stemConfig" />
    <v-rect
      v-for="a in overlay.anchors"
      :key="a.id"
      :config="anchorConfig(a)"
    />
    <v-circle v-if="overlay.rotateHandle" :config="rotateConfig" />
  </v-group>
  <Teleport to="body">
    <div
      v-if="angleLabel"
      class="vkedit-rotate-angle-label"
      :style="{ left: angleLabel.x + 'px', top: angleLabel.y + 'px' }"
    >
      {{ angleLabel.text }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { type EditorHost } from '@/core'
import { useTransformOverlay, type OverlayAnchorView } from '@/hooks/use-transform-overlay'
import { cssColorVar } from '@/utils/css-var'

const props = defineProps<{ host: EditorHost }>()

const { overlay, cursor, onOverlayPointerDown, angleLabel } = useTransformOverlay(props.host)

const groupConfig = computed(() => ({
  name: 'transform-overlay',
  id: 'transform-overlay',
  listening: true,
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

<style>
.vkedit-rotate-angle-label {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1.2;
  border-radius: 4px;
  background: var(--vkedit-color-surface-solid, #fff);
  color: var(--vkedit-color-text, #111);
  border: 1px solid var(--vkedit-color-border, #ccc);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
</style>
