<template>
  <VkButton
    v-bind="$attrs"
    :variant="enabled ? 'secondary' : 'ghost'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? (enabled ? '关闭吸附' : '开启吸附') : undefined"
    @click="toggle"
  >
    <IconGridOn
      :width="20"
      :style="{ opacity: enabled ? 1 : 0.4 }"
    />
  </VkButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VkButton } from '@/components/ui'
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

<style scoped></style>
