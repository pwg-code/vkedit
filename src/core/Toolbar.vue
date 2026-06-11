<template>
  <div class="flex h-full items-center justify-center m-auto">
    <!-- 文件操作 -->
    <div class="vkedit-toolbar__left">
      <slot name="left" :host="host"></slot>
    </div>

    <!-- 撤销重做 -->
    <div class="vkedit-toolbar__center">
      <div>
        <VkButton text title="撤销" @click="handleUndo" :disabled="!canUndo" variant="ghost"
          ><Icon icon="material-symbols-light:undo" width="25px"></Icon
        ></VkButton>
        <VkButton text title="重做" @click="handleRedo" :disabled="!canRedo" variant="ghost"
          ><Icon icon="material-symbols-light:redo" width="25px"></Icon
        ></VkButton>
      </div>
      <template v-for="item in tools">
        <component :is="item.render()" :host="host"></component>
      </template>
      <slot name="center" :host="host"></slot>
    </div>

    <div class="vkedit-toolbar__right">
      <!-- <Button @click="handleLoadByJSON">加载</Button>
      <Button @click="handleSave">保存</Button> -->
      <slot name="right" :host="host"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { IEditorState, ToolEventData } from '../types'
import type { EditorHost } from '@/core'
import { VkButton } from '@/components/ui'
import { ToolbarManagerPlugin } from '@/plugins'
import { Icon } from '@iconify/vue'

interface Props {
  host: EditorHost
}

const { host } = defineProps<Props>()

const hostState = ref<IEditorState>(host.status)

// 插件工具
const toolbarPlugin = host.getPlugin('toolbar-manager-plugin')

const tools = ref<ToolEventData[]>()

const initTools = () => {
  if (toolbarPlugin?.getTools) {
    tools.value = toolbarPlugin.getTools()
  }
}

// // 光标位置
// const cursorPosition = ref({ x: 0, y: 0 })

// 计算属性
const canUndo = computed(() => {
  // 这里应该从命令系统获取实际状态
  return true
})

const canRedo = computed(() => {
  // 这里应该从命令系统获取实际状态
  return true
})

const handleUndo = () => {
  host.undo()
}

const handleRedo = () => {
  host.redo()
}

function handleSave() {
}

function handleLoadByJSON() {
  const jsonStr = `{"state":{"zoom":1,"currentTool":"select","snapToGrid":true,"showGrid":false,"width":500,"height":800},"elements":[{"type":"table","id":"51215ff6-3a43-4491-b39c-37cbd6af1ede","x":87,"y":221,"width":300,"height":80,"rotation":0,"scaleX":1,"scaleY":1,"visible":true,"locked":false,"rowsHeight":[40,40],"colsWidth":[100,100,100],"cells":[[{"rowIndex":0,"colIndex":0,"fill":"#000000","text":"文本","isMergeLeft":false,"isMergeUp":false,"fontSize":14},{"rowIndex":0,"colIndex":1,"fill":"#000000","text":"文本","isMergeLeft":false,"isMergeUp":false,"fontSize":14},{"rowIndex":0,"colIndex":2,"fill":"#000000","text":"文本","isMergeLeft":false,"isMergeUp":false,"fontSize":14}],[{"rowIndex":1,"colIndex":0,"fill":"#000000","text":"文本","isMergeLeft":false,"isMergeUp":false,"fontSize":14},{"rowIndex":1,"colIndex":1,"fill":"#000000","text":"123","isMergeLeft":false,"isMergeUp":false,"fontSize":14},{"rowIndex":1,"colIndex":2,"fill":"#000000","text":"文本","isMergeLeft":false,"isMergeUp":false,"fontSize":14}]]}]}`
  host.loadJSON(jsonStr)
}

// 生命周期
onMounted(() => {
  initTools()
})
</script>

<style scoped></style>
