<template>
  <VkButton variant="ghost" @click="handleAddRow">下方插入行</VkButton>
  <VkButton variant="ghost" @click="handleAddColumn">右侧插入列</VkButton>
  <VkButton variant="ghost" @click="handleDeleteRow">删除当前行</VkButton>
  <VkButton variant="ghost" @click="handleDeleteColumn">删除当前列</VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import type { EditorHost } from '@/core'
import type { TableElement } from './table'

const { host, element, selection } = defineProps<{
  host: EditorHost
  element: TableElement
  selection: TableElement[]
}>()

const handleAddRow = () => {
  element.addRow(element.activeRow)
}

const handleAddColumn = () => {
  element.addCol(element.activeCol)
}

const handleDeleteRow = () => {
  element.removeRow(element.activeRow)
}

const handleDeleteColumn = () => {
  element.removeCol(element.activeCol)
}
</script>

<style scoped></style>
