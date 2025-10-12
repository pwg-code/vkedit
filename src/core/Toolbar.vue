<template>
  <div class="flex h-full items-center justify-center m-auto">
    <!-- 文件操作 -->
    <div class="w-[200px] flex items-end"></div>

    <!-- 撤销重做 -->
    <div class="flex-1 flex gap-2">
      <ElButtonGroup>
        <ToolbarButton icon="↩️" title="撤销" :disabled="!canUndo" @click="handleUndo" />
        <ToolbarButton icon="↪️" title="重做" :disabled="!canRedo" @click="handleRedo" />
        <!-- <ToolbarButton icon="⬅️" title="左对齐" @click="handleAlign('left')" />
        <ToolbarButton icon="➡️" title="右对齐" @click="handleAlign('right')" />
        <ToolbarButton icon="⬆️" title="上对齐" @click="handleAlign('top')" />
        <ToolbarButton icon="⬇️" title="下对齐" @click="handleAlign('bottom')" /> -->
      </ElButtonGroup>
      <!-- <ElButtonGroup>
        <ToolbarButton
          v-for="tool in pluginTools"
          :key="tool.id"
          :icon="tool.icon"
          :title="tool.title"
          :active="hostState.currentTool === tool.id"
          @click="handlePluginToolSelect(tool)"
        />
      </ElButtonGroup> -->
      <template v-for="item in tools">
        <component :is="item.getComponent()" :host="host"></component>
      </template>
    </div>

    <div class="w-[200px]">
      <ElButtonGroup>
        <ToolbarButton icon="💾" title="保存"></ToolbarButton>
      </ElButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { IEditorHost, IEditorState, IToolbar } from '../types'
import ToolbarButton from '@/components/ToolbarButton.vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import { ToolbarPlugin } from '@/plugins'
interface Props {
  host: IEditorHost
}

const { host } = defineProps<Props>()

const hostState = ref<IEditorState>(host.getState())

// 插件工具
const toolbarPlugin = host.getPlugin<ToolbarPlugin>('toolbar')

const tools = ref<IToolbar[]>()

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

// 生命周期
onMounted(() => {
  initTools()
})
</script>

<style scoped></style>
