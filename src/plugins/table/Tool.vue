<template>
  <VkButton v-bind="$attrs" variant="outline" @click="handleClick">表格</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { TableElement } from './table'
import type { EditorHost } from '@/core';

const { host } = defineProps<{
  host: EditorHost
}>()

function handleClick() {
  host.executeCommand(new AddElementCommand(host ,new TableElement(host)))
}
</script>

<style scoped></style>
