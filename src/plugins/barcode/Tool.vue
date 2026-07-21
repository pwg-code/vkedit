<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="'条形码'"
    @click="handleClick"
  >
    <Icon icon="material-symbols-light:barcode" width="20" />
    <span v-if="!collapsed">条形码</span>
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
