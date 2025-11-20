<template>
  <Button v-bind="$attrs" variant="outline" @click="handleClick">矩形</Button>
</template>

<script setup lang="ts">
import { AddElementCommand } from '@/commands';
import { Button } from '@/components/ui/button'
import type { EditorHost } from '@/core'
import { RectElement } from './rect';
// 接收host
const { host } = defineProps<{
  host: EditorHost
}>()

function handleClick() {
  // 使用元素管理插件创建
  // 创建文本元素实例
  const rect = new RectElement(host, { xmm: 50, ymm: 50 })
  // 使用命令添加元素
  host.executeCommand(new AddElementCommand(host, rect))
}
</script>

<style scoped></style>
