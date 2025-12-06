<template>
  <Button v-bind="$attrs" variant="outline" @click="handleClick">二维码</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AddElementCommand } from '@/commands'
import { QrElement } from './qr'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleClick() {
  if (!host) return
  const el = new QrElement(host, { x: 50, y: 50 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
