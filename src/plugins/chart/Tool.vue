<template>
  <VkButton v-bind="$attrs" variant="outline" @click="handleClick">图表</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { ChartElement } from './chart'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleClick() {
  if (!host) return
  const el = new ChartElement(host, { xmm: 5, ymm: 5 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
