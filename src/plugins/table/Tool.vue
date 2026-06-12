<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '表格' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:table" width="18" />
    <template v-else>表格</template>
  </VkButton>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { TableElement } from './table'
import type { EditorHost } from '@/core';

const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  host.executeCommand(new AddElementCommand(host ,new TableElement(host)))
}
</script>

<style scoped></style>
