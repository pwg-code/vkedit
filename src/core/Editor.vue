<template>
  <div class="vkedit-editor">
    <div v-if="isTooSmall" class="vkedit-editor__minwidth-warning">
      <p>请使用宽度不低于 800px 的屏幕访问本编辑器</p>
    </div>
    <!-- 画布全屏底层 -->
    <div class="vkedit-stage-view">
      <StageView :host="host" :key="stageKey" />
    </div>

    <!-- 顶部悬浮工具栏 -->
    <Transition name="vkedit-toolbar" appear>
      <Toolbar v-if="showToolbar" :host="host">
        <template #actions>
          <slot name="toolbar-actions" :host="host" />
        </template>
      </Toolbar>
    </Transition>

    <!-- 左侧悬浮工具箱 -->
    <div
      v-if="showToolbox"
      class="vkedit-floating-toolbox"
      :class="{ 'vkedit-floating-toolbox--collapsed': toolboxCollapsed }"
    >
      <div class="vkedit-floating-toolbox__title">
        <span>添加图形</span>
        <button
          class="vkedit-floating-toolbox__toggle"
          @click="toggleToolbox"
          :title="toolboxCollapsed ? '展开工具箱' : '收起工具箱'"
        >
          <Icon :icon="toolboxCollapsed ? 'material-symbols-light:chevron-right' : 'material-symbols-light:chevron-left'" width="16" />
        </button>
      </div>
      <div class="vkedit-floating-toolbox__content" v-if="!toolboxCollapsed">
        <GraphicToolPanel :host="host" :collapsed="toolboxCollapsed">
          <template #toolbox>
            <slot name="toolbox" :host="host"></slot>
          </template>
        </GraphicToolPanel>
      </div>
      <div v-else class="vkedit-floating-toolbox__collapsed-icon" @click="toggleToolbox" :title="'展开工具箱'">
        <Icon icon="material-symbols-light:shapes" width="20" />
      </div>
    </div>

    <!-- 右侧悬浮属性面板 -->
    <div
      v-if="showPropertyPanel"
      class="vkedit-floating-property-panel"
      :class="{ 'vkedit-floating-property-panel--collapsed': propertyPanelCollapsed }"
    >
      <div class="vkedit-floating-property-panel__title">
        <span>{{ panelTitle }}</span>
        <button
          class="vkedit-floating-property-panel__toggle"
          @click="togglePropertyPanel"
          :title="propertyPanelCollapsed ? '展开属性面板' : '收起属性面板'"
        >
          <Icon :icon="propertyPanelCollapsed ? 'material-symbols-light:chevron-left' : 'material-symbols-light:chevron-right'" width="16" />
        </button>
      </div>
      <div class="vkedit-floating-property-panel__content" v-if="!propertyPanelCollapsed">
        <PropertyPanel :host="host" :collapsed="propertyPanelCollapsed">
          <template #property-panel>
            <slot name="property-panel" :host="host"></slot>
          </template>
        </PropertyPanel>
      </div>
      <div v-else class="vkedit-floating-property-panel__collapsed-icon" @click="togglePropertyPanel" :title="'展开属性面板'">
        <Icon icon="material-symbols-light:settings" width="20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Toolbar from './Toolbar.vue' // 顶部区域
import GraphicToolPanel from './GraphicToolPanel.vue'
import StageView from './StageView.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { EditorHost } from '@/core'
import { onMounted, onUnmounted, ref } from 'vue'

const {
  host,
  showToolbox = true,
  showPropertyPanel = true,
  showToolbar = true,
} = defineProps<{
  host: EditorHost
  showToolbox?: boolean
  showPropertyPanel?: boolean
  showToolbar?: boolean
}>()

const stageKey = ref(`stage-${Date.now()}`)
const toolboxCollapsed = ref(false)
const propertyPanelCollapsed = ref(false)
const panelTitle = ref('画布属性')
const isTooSmall = ref(window.innerWidth < 800)

const toggleToolbox = () => {
  toolboxCollapsed.value = !toolboxCollapsed.value
}

const togglePropertyPanel = () => {
  propertyPanelCollapsed.value = !propertyPanelCollapsed.value
}

const onResize = () => {
  if (window.innerWidth < 1024) {
    toolboxCollapsed.value = true
    propertyPanelCollapsed.value = true
  }
  isTooSmall.value = window.innerWidth < 800
}

// 绑定舞台重绘事件
onMounted(() => {
  host.on('stage:redraw', () => {
    // 强制更改key 以触发StageView重绘
    stageKey.value = `stage-${Date.now()}`
  })
  host.on('selection:changed', (data: { selection: any[] }) => {
    panelTitle.value = data.selection.length > 0 ? '元素属性' : '画布属性'
  })
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.vkedit-toolbar-enter-active {
  animation: vkedit-toolbar-enter 200ms ease-out;
}

.vkedit-toolbar-leave-active {
  animation: vkedit-toolbar-leave 150ms ease-in;
}
</style>
