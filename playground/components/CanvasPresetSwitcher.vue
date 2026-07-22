<template>
  <VkDropdown>
    <template #trigger>
      <VkButton size="sm">画布: {{ currentPresetName }}</VkButton>
    </template>
    <div class="preset-menu">
      <div
        v-for="preset in canvasPresets"
        :key="preset.key"
        :class="['preset-menu__item', { 'preset-menu__item--active': preset.key === currentKey }]"
        @click="applyPreset(preset)"
      >
        <span class="preset-menu__name">{{ preset.name }}</span>
        <span class="preset-menu__size">{{ preset.width }}×{{ preset.height }}mm</span>
      </div>
    </div>
  </VkDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EditorHost } from '@/core/editor-host'
import VkDropdown from '@/components/ui/VkDropdown.vue'
import VkButton from '@/components/ui/VkButton.vue'
import { canvasPresets, type CanvasPreset } from '../presets/canvas-presets'

const props = defineProps<{ host: EditorHost }>()

const currentKey = computed(() => {
  const { wmm, hmm, dpm } = props.host.status
  const matched = canvasPresets.find((p) => p.width === wmm && p.height === hmm && p.dpm === dpm)
  return matched?.key ?? ''
})

const currentPresetName = computed(() => {
  return canvasPresets.find((p) => p.key === currentKey.value)?.name ?? '自定义'
})

function applyPreset(preset: CanvasPreset) {
  const { width, height, dpm } = preset
  props.host.setStatus({
    width: width * dpm,
    height: height * dpm,
    wmm: width,
    hmm: height,
    dpm,
  })
  props.host.emit('stage:redraw', {})
}
</script>

<style scoped>
.preset-menu {
  min-width: 180px;
  padding: 4px;
}

.preset-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--vkedit-color-text-dark);
  transition: background 0.15s;
}

.preset-menu__item:hover {
  background: var(--vkedit-color-bg-dark-hover);
}

.preset-menu__item--active {
  background: var(--vkedit-color-bg-dark-active);
  color: var(--vkedit-color-white);
  font-weight: 500;
}

.preset-menu__size {
  font-size: 12px;
  color: var(--vkedit-color-text-dark-secondary);
}

.preset-menu__item--active .preset-menu__size {
  color: var(--vkedit-color-text-dark);
}
</style>
