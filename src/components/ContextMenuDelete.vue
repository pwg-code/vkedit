<!-- 删除元素上下文菜单 -->
<template>
  <VkButton variant="ghost" @click="handleDelete" size="xs">删除
  </VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
// 导入删除元素命令
import { RemoveElementCommand, BatchCommand } from '@/commands'
import type { SelectionPlugin } from '@/plugins'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()

function handleDelete() {
  // 删除选中的元素
  const selection = host.getPlugin<SelectionPlugin>('selection-plugin').getSelectionElements()

  // 创建批量删除命令并执行
  const batchCommand = new BatchCommand(
    host,
    selection.map((el) => new RemoveElementCommand(el, host)),
  )
  host.executeCommand(batchCommand)
}
</script>

<style scoped></style>
