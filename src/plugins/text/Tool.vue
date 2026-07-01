<template>
  <VkButton
    v-bind="$attrs"
    :variant="collapsed ? 'ghost' : 'outline'"
    :size="collapsed ? 'icon' : 'default'"
    :title="collapsed ? '文本' : undefined"
    @click="handleClick"
  >
    <Icon v-if="collapsed" icon="material-symbols-light:format-text" width="18" />
    <template v-else>文本</template>
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
