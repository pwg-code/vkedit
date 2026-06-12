<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '图表' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:bar-chart" width="18" />
    <template v-else>图表</template>
  </VkButton>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { ChartElement } from './chart'

const { host, collapsed = false } = defineProps<{
  host: import('@/core').EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  if (!host) return
  const el = new ChartElement(host, { xmm: 5, ymm: 5 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
