<template>
  <VkButton v-bind="$attrs" variant="outline" @click="handleClick">条码</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { BarcodeElement } from './barcode'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleClick() {
  if (!host) return
  const el = new BarcodeElement(host, { x: 50, y: 50 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
