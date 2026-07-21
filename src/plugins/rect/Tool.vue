<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="'矩形'"
    @click="handleClick"
  >
    <Icon icon="material-symbols-light:rectangle" width="20" />
    <span v-if="!collapsed">矩形</span>
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
