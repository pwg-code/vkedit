<template>
  <VkButton v-bind="$attrs" variant="outline" @click="handleClick">二维码</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { QrcodeElement } from './qrcode'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleClick() {
  if (!host) return
  const el = new QrcodeElement(host, { x: 50, y: 50 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
