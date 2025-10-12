<template>
  <div>
    <ElButton @click="handleAlign('left')">左对齐</ElButton>
    <ElButton @click="handleAlign('right')">右对齐</ElButton>
    <ElButton @click="handleAlign('top')">上对齐</ElButton>
    <ElButton @click="handleAlign('bottom')">下对齐</ElButton>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ElButton } from 'element-plus'
import type { SelectionPlugin } from '../SelectionPlugin'
import { AlignElementsCommand } from '@/commands'

const { host } = defineProps<{ host: IEditorHost }>()

function handleAlign(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {
  const selectionElements = host.getPlugin<SelectionPlugin>('selection')?.selectionElements
  if (!selectionElements) return
  host.executeCommand(
    new AlignElementsCommand(host, alignment, Array.from(selectionElements?.keys())),
  )
}
</script>

<style scoped></style>
