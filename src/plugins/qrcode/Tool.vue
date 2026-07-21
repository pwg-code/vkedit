<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="'二维码'"
    @click="handleClick"
  >
    <Icon icon="material-symbols-light:qr-code-2" width="20" />
    <span v-if="!collapsed">二维码</span>
  </VkButton>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { QrcodeElement } from './qrcode'

const { host, collapsed = false } = defineProps<{
  host: import('@/core').EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  if (!host) return
  const el = new QrcodeElement(host, { x: 50, y: 50 })
  host.executeCommand(new AddElementCommand(host, el))
}
</script>

<style scoped></style>
