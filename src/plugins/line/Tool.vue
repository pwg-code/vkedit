<template>
  <VkButton v-bind="$attrs" variant="outline" @click="handleClick">直线</VkButton>
</template>

<script setup lang="ts">
import { AddElementCommand } from '@/commands'
import { VkButton } from '@/components/ui'
import type { EditorHost } from '@/core'
import { LineElement } from './line'
// 接收host
const { host } = defineProps<{
  host: EditorHost
}>()

function handleClick() {
  const rect = new LineElement(host, { xmm: 5, ymm: 5 })
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(host, rect))
}
</script>

<style scoped></style>
