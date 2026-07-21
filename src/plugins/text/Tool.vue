<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="'文本'"
    @click="handleClick"
  >
    <Icon icon="material-symbols-light:text-fields" width="20" />
    <span v-if="!collapsed">文本</span>
  </VkButton>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import { TextElement } from './text'

const { host, collapsed = false } = defineProps<{
  host: import('@/core').EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  if (!host) return
  // 创建文本元素实例
  const text = new TextElement(host, { x: 50, y: 50 })
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(host, text))
}
</script>

<style scoped></style>
