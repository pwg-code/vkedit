<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '矩形' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:rectangle" width="18" />
    <template v-else>矩形</template>
  </VkButton>
</template>

<script setup lang="ts">
import { AddElementCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import type { EditorHost } from '@/core'
import { RectElement } from './rect'
// 接收host
const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  // 使用元素管理插件创建
  // 创建文本元素实例
  const rect = new RectElement(host, { xmm: 5, ymm: 5 })
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(host, rect))
}
</script>

<style scoped></style>
