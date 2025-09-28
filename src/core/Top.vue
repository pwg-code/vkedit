<template>
  <div class="toolbar">
    <!-- 文件操作 -->
    <div class="toolbar-section">
      <ToolbarButton icon="📁" title="新建" :active="false" @click="handleNew" />
      <ToolbarButton icon="📂" title="打开" :active="false" @click="handleOpen" />
      <ToolbarButton icon="💾" title="保存" :active="false" @click="handleSave" />
      <ToolbarButton icon="🖨️" title="导出" :active="false" @click="handleExport" />
    </div>

    <!-- 撤销重做 -->
    <div class="toolbar-section">
      <ToolbarButton icon="↩️" title="撤销" :disabled="!canUndo" @click="handleUndo" />
      <ToolbarButton icon="↪️" title="重做" :disabled="!canRedo" @click="handleRedo" />
    </div>

    <!-- 工具选择 -->
    <div class="toolbar-section">
      <ToolbarButton
        v-for="tool in drawingTools"
        :key="tool.name"
        :icon="tool.icon"
        :title="tool.title"
        :active="host.state.currentTool === tool.name"
        @click="handleToolSelect(tool.name)"
      />
    </div>

    <!-- 视图控制 -->

    <div class="toolbar-section">
      <ToolbarButton icon="🔍" title="缩放" :active="false" @click="handleZoom" />
      <ToolbarButton
        :icon="host.state.showGrid ? '🔲' : '🔳'"
        :title="host.state.showGrid ? '隐藏网格' : '显示网格'"
        :active="host.state.showGrid"
        @click="handleToggleGrid"
      />

      <ToolbarButton
        :icon="host.state.snapToGrid ? '🧲' : '🔗'"
        :title="host.state.snapToGrid ? '关闭吸附' : '开启吸附'"
        :active="host.state.snapToGrid"
        @click="handleToggleSnap"
      />
    </div>

    <!-- 对齐工具 -->

    <div class="toolbar-section" v-if="hasSelection">
      <ToolbarButton icon="⬅️" title="左对齐" @click="handleAlign('left')" />
      <ToolbarButton icon="➡️" title="右对齐" @click="handleAlign('right')" />
      <ToolbarButton icon="⬆️" title="上对齐" @click="handleAlign('top')" />
      <ToolbarButton icon="⬇️" title="下对齐" @click="handleAlign('bottom')" />
      <ToolbarButton icon="⏺️" title="水平居中" @click="handleAlign('centerX')" />
      <ToolbarButton icon="⏺️" title="垂直居中" @click="handleAlign('centerY')" />
    </div>

    <!-- 分布工具 -->

    <div class="toolbar-section" v-if="hasMultipleSelection">
      <ToolbarButton icon="↔️" title="水平分布" @click="handleDistribute('horizontal')" />
      <ToolbarButton icon="↕️" title="垂直分布" @click="handleDistribute('vertical')" />
    </div>

    <!-- 图层操作 -->

    <div class="toolbar-section" v-if="hasSelection">
      <ToolbarButton icon="⬆️" title="上移一层" @click="handleLayerChange('up')" />
      <ToolbarButton icon="⬇️" title="下移一层" @click="handleLayerChange('down')" />
      <ToolbarButton icon="🔝" title="置顶" @click="handleLayerChange('top')" />
      <ToolbarButton icon="🔚" title="置底" @click="handleLayerChange('bottom')" />
    </div>

    <!-- 插件工具栏 -->

    <div class="toolbar-section" v-if="pluginTools.length > 0">
      <ToolbarButton
        v-for="tool in pluginTools"
        :key="tool.id"
        :icon="tool.icon"
        :title="tool.title"
        :active="host.state.currentTool === tool.id"
        @click="handlePluginToolSelect(tool)"
      />
    </div>

    <!-- 缩放控制 -->
    <div class="toolbar-section zoom-controls">
      <span class="zoom-label">缩放:</span>
      <button class="zoom-btn" @click="handleZoomOut" title="缩小">-</button>
      <span class="zoom-value">{{ Math.round(host.state.zoom * 100) }}%</span>
      <button class="zoom-btn" @click="handleZoomIn" title="放大">+</button>
      <button class="zoom-btn" @click="handleZoomToFit" title="适应画布">⤢</button>
      <button class="zoom-btn" @click="handleZoomReset" title="重置缩放">1:1</button>
    </div>

    <!-- 状态显示 -->
    <div class="toolbar-status">
      <span class="status-item">工具: {{ currentToolTitle }}</span>
      <span class="status-item" v-if="hasSelection">
        选中: {{ host.state.selectedElementIds.length }} 个元素
      </span>
      <span class="status-item">坐标: ({{ cursorPosition.x }}, {{ cursorPosition.y }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { IEditorHost } from './types'
import ToolbarButton from './ToolbarButton.vue'
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

const hasSelection = computed(() => {
  return props.host.state.selectedElementIds.length > 0
})

const hasMultipleSelection = computed(() => {
  return props.host.state.selectedElementIds.length > 1
})

const currentToolTitle = computed(() => {
  const tool = drawingTools.value.find((t) => t.name === props.host.state.currentTool)

  return tool ? tool.title : '未知工具'
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
    showGrid: !props.host.state.showGrid,
  })
}

const handleToggleSnap = () => {
  props.host.setState({
    snapToGrid: !props.host.state.snapToGrid,
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

const handleZoomIn = () => {
  const newZoom = Math.min(props.host.state.zoom * 1.2, 5)

  props.host.setState({ zoom: newZoom })
}

const handleZoomOut = () => {
  const newZoom = Math.max(props.host.state.zoom / 1.2, 0.1)

  props.host.setState({ zoom: newZoom })
}

const handleZoomReset = () => {
  props.host.setState({ zoom: 1 })
}

const handleZoomToFit = () => {
  props.host.emit('view:zoomToFit')
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

<style scoped>
.toolbar {
  display: flex;

  align-items: center;

  padding: 8px 12px;

  background: #2c3e50;

  color: white;

  border-bottom: 1px solid #34495e;

  flex-wrap: wrap;

  gap: 4px;

  min-height: 60px;
}

.toolbar-section {
  display: flex;

  align-items: center;

  gap: 2px;

  padding: 0 8px;

  border-right: 1px solid #34495e;
}

.toolbar-section:last-child {
  border-right: none;
}

.zoom-controls {
  display: flex;

  align-items: center;

  gap: 4px;

  margin-left: auto;
}

.zoom-label {
  font-size: 12px;

  margin-right: 4px;
}

.zoom-btn {
  background: #34495e;

  border: 1px solid #4a6572;

  color: white;

  width: 24px;

  height: 24px;

  border-radius: 3px;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 12px;
}

.zoom-btn:hover {
  background: #4a6572;
}

.zoom-value {
  font-size: 12px;

  min-width: 40px;

  text-align: center;
}

.toolbar-status {
  display: flex;

  align-items: center;

  gap: 16px;

  margin-left: 16px;

  font-size: 12px;

  color: #bdc3c7;
}

.status-item {
  white-space: nowrap;
}

/* 响应式设计 */

@media (max-width: 1200px) {
  .toolbar {
    padding: 6px 8px;
  }

  .toolbar-section {
    padding: 0 4px;
  }

  .toolbar-status {
    display: none;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;

    height: auto;

    min-height: 80px;
  }

  .toolbar-section {
    border-right: none;

    border-bottom: 1px solid #34495e;

    padding: 4px 0;

    width: 100%;

    justify-content: center;
  }

  .zoom-controls {
    margin-left: 0;

    order: -1;
  }
}
</style>
