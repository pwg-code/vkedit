<template>
  <button
    :class="['snap-toggle', { 'snap-toggle--active': enabled }]"
    :title="collapsed ? (enabled ? '关闭吸附' : '开启吸附') : undefined"
    @click="toggle"
  >
    <IconGridOn :width="20" :style="{ opacity: enabled ? 1 : 0.4 }" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconGridOn from '~icons/material-symbols-light/grid-on'
import type { EditorHost } from '@/core'

const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

const snapPlugin = computed(() => host.getPlugin('snap-plugin'))

const enabled = computed(() => snapPlugin.value?.isSnapEnabled() ?? false)

function toggle() {
  snapPlugin.value?.toggleSnap()
}
</script>

<style scoped>
.snap-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 8px 0;
  border: none;
  border-radius: var(--vkedit-radius-sm);
  background: transparent;
  color: var(--vkedit-color-text-dark-secondary);
  cursor: pointer;
  transition: var(--vkedit-transition-colors);
}

.snap-toggle:hover {
  background: var(--vkedit-color-bg-dark-hover);
  color: var(--vkedit-color-text-dark);
}

.snap-toggle--active {
  background: var(--vkedit-color-bg-dark-active);
  color: var(--vkedit-color-white);
}
</style>
