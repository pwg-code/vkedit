<template>
  <div class="flex h-full items-center justify-center m-auto">
    <!-- 文件操作 -->
    <div class="w-[200px] flex items-end"></div>

    <!-- 撤销重做 -->
    <div class="flex-1">
      <ElButtonGroup>
        <ToolbarButton icon="↩️" title="撤销" :disabled="!canUndo" @click="handleUndo" />
        <ToolbarButton icon="↪️" title="重做" :disabled="!canRedo" @click="handleRedo" />
        <ToolbarButton icon="⬅️" title="左对齐" @click="handleAlign('left')" />
        <ToolbarButton icon="➡️" title="右对齐" @click="handleAlign('right')" />
        <ToolbarButton icon="⬆️" title="上对齐" @click="handleAlign('top')" />
        <ToolbarButton icon="⬇️" title="下对齐" @click="handleAlign('bottom')" />
      </ElButtonGroup>
      <ElButtonGroup>
        <ToolbarButton
          v-for="tool in pluginTools"
          :key="tool.id"
          :icon="tool.icon"
          :title="tool.title"
          :active="hostState.currentTool === tool.id"
          @click="handlePluginToolSelect(tool)"
        />
      </ElButtonGroup>
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
import type { IEditorHost, IEditorState } from '../types'
import ToolbarButton from '@/components/ToolbarButton.vue'
import { ElButton, ElButtonGroup } from 'element-plus'
interface Props {
  host: IEditorHost
}

interface PluginTool {
  id: string
  name: string
  icon: string
  title: string
  pluginName: string
}

const props = defineProps<Props>()
// 绘图工具定义
const drawingTools = ref([
  { name: 'select', icon: '👉', title: '选择工具' },
  { name: 'rect', icon: '⬜', title: '矩形' },
  { name: 'circle', icon: '⭕', title: '圆形' },
  { name: 'text', icon: '📝', title: '文本' },
  { name: 'line', icon: '📏', title: '直线' },
  { name: 'path', icon: '✏️', title: '路径' },
  { name: 'eraser', icon: '🧹', title: '橡皮擦' },
  { name: 'hand', icon: '✋', title: '手形工具' },
])

const hostState = ref<IEditorState>(props.host.getState())

// 插件工具
const pluginTools = ref<PluginTool[]>([])
// 光标位置
const cursorPosition = ref({ x: 0, y: 0 })
// 计算属性
const canUndo = computed(() => {
  // 这里应该从命令系统获取实际状态
  return true
})

const canRedo = computed(() => {
  // 这里应该从命令系统获取实际状态
  return true
})

// 生命周期
onMounted(() => {
  // 监听光标移动
  props.host.on('canvas:mousemove', handleCursorMove)
  // 监听插件注册事件，更新插件工具
  props.host.on('plugin:registered', handlePluginRegistered)
  // 初始化插件工具
  initializePluginTools()
})

onUnmounted(() => {
  props.host.off('canvas:mousemove', handleCursorMove)
  props.host.off('plugin:registered', handlePluginRegistered)
})

// 事件处理函数

const handleNew = () => {
  if (confirm('确定要创建新文档吗？未保存的更改将会丢失。')) {
    props.host.emit('file:new')
  }
}

const handleOpen = () => {
  props.host.emit('file:open')
}

const handleSave = () => {
  props.host.emit('file:save')
}

const handleExport = () => {
  props.host.emit('file:export')
}

const handleUndo = () => {
  props.host.undo()
}

const handleRedo = () => {
  props.host.redo()
}

const handleToolSelect = (toolName: string) => {
  props.host.setState({
    currentTool: toolName,
  })

  props.host.emit('tool:changed', toolName)
}

const handleZoom = () => {
  // 打开缩放面板或执行缩放操作
  props.host.emit('view:zoom')
}

const handleToggleGrid = () => {
  props.host.setState({
    showGrid: !hostState.value.showGrid,
  })
}

const handleToggleSnap = () => {
  props.host.setState({
    snapToGrid: !hostState.value.snapToGrid,
  })
}

const handleAlign = (alignment: string) => {
  props.host.emit('elements:align', alignment)
}

const handleDistribute = (direction: string) => {
  props.host.emit('elements:distribute', direction)
}

const handleLayerChange = (operation: string) => {
  props.host.emit('elements:layer', operation)
}

const handleCursorMove = (point: { x: number; y: number }) => {
  cursorPosition.value = {
    x: Math.round(point.x),
    y: Math.round(point.y),
  }
}

const handlePluginToolSelect = (tool: PluginTool) => {
  props.host.setState({
    currentTool: tool.id,
  })

  props.host.emit('plugin:tool:activated', tool)
}

const handlePluginRegistered = (plugin: any) => {
  // 检查插件是否提供了工具栏工具

  if (plugin.getTools) {
    const tools = plugin.getTools()
    if (Array.isArray(tools)) {
      pluginTools.value = [
        ...pluginTools.value,
        ...tools.map((tool: any) => ({
          ...tool,
          pluginName: plugin.name,
        })),
      ]
    }
  }
}

const initializePluginTools = () => {
  // 从已注册的插件中获取工具
  // 这里需要根据实际插件系统实现
}
</script>

<style scoped></style>
