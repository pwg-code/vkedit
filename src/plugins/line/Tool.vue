<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '直线' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:pen-size-1" width="18" />
    <template v-else>直线</template>
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
