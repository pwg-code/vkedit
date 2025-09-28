<template>
  <div class="p-5 flex gap-2">
    <ElButton @click="handleToolSelect('select')">选择</ElButton>
    <ElButton @click="handleToolSelect('rect-plugin')">矩形</ElButton>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ElButton } from 'element-plus'
const props = defineProps<{
  host: IEditorHost
}>()

const handleToolSelect = (toolName: string) => {
  props.host.setState({ currentTool: toolName })
  props.host.emit('tool-changed', toolName)
  console.log('当前host state', props.host.getState())
}

function startDrag(e: any, name: string) {
  e.dataTransfer.setData('plugin-name', name)
}
</script>
