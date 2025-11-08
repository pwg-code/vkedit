<template>
  <Button v-bind="$attrs" variant="outline" @click="handleClick">文本</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AddElementCommand } from '@/commands'
import { TextElement } from './text'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleClick() {
  if (!host) return
  // 创建文本元素实例
  const text = new TextElement(50, 50)
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(text, host))
}
</script>

<style scoped></style>
