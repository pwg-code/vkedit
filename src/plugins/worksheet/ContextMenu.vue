<template>
  <VkButton variant="ghost" @click="handleAddRow">下方插入行</VkButton>
  <VkButton variant="ghost" @click="handleAddColumn">右侧插入列</VkButton>
  <VkButton variant="ghost" @click="handleDeleteRow">删除当前行</VkButton>
  <VkButton variant="ghost" @click="handleDeleteColumn">删除当前列</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import type { EditorHost } from '@/core'
import type { WorksheetElement } from './worksheet'
import {
  InsertRowCommand,
  InsertColumnCommand,
  RemoveRowCommand,
  RemoveColumnCommand,
} from './command'

const { host, element, selection } = defineProps<{
  host: EditorHost
  element: WorksheetElement
  selection: WorksheetElement[]
}>()

const handleAddRow = () => {
  // 使用命令
  host.executeCommand(new InsertRowCommand(element, element.activeCell?.row || 0))
}

const handleAddColumn = () => {
  // 使用命令
  host.executeCommand(new InsertColumnCommand(element, element.activeCell?.col || 0))
}

const handleDeleteRow = () => {
  // 使用命令
  host.executeCommand(new RemoveRowCommand(element, element.activeCell?.row || 0))
}

const handleDeleteColumn = () => {
  // 使用命令
  host.executeCommand(new RemoveColumnCommand(element, element.activeCell?.col || 0))
}
</script>

<style scoped></style>
