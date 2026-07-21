<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="'线条'"
    @click="handleClick"
  >
    <Icon icon="material-symbols-light:pen-size-1" width="20" />
    <span v-if="!collapsed">线条</span>
  </VkButton>
</template>

<script setup lang="ts">
import { AddElementCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import type { EditorHost } from '@/core'
import { LineElement } from './line'
// 接收host
const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  const rect = new LineElement(host, { xmm: 5, ymm: 5 })
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(host, rect))
}
</script>

<style scoped></style>
