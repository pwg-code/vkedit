<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '条码' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:barcode" width="18" />
    <template v-else>条码</template>
  </VkButton>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { BarcodeElement } from './barcode'

const { host, collapsed = false } = defineProps<{
  host: import('@/core').EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  if (!host) return
  const el = new BarcodeElement(host, { x: 50, y: 50 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
