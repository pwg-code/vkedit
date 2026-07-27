<template>
  <div class="vkedit-editor" data-vkedit-theme="dark">
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

    <!-- 左侧固定侧边栏 -->
    <div
      v-if="showToolbox"
      class="vkedit-floating-toolbox"
      :class="{ 'vkedit-floating-toolbox--collapsed': toolboxCollapsed }"
      :style="{ '--vkedit-sidebar-width': `${toolboxWidth}px` }"
    >
      <!-- 折叠态：仅显示汉堡按钮 -->
      <div v-if="toolboxCollapsed" class="vkedit-floating-toolbox__collapsed-icon" @click="toggleToolbox" title="展开工具箱">
        <IconMenu width="20" />
      </div>

      <!-- 展开态 -->
      <template v-else>
        <div class="vkedit-floating-toolbox__title">
          <span class="vkedit-floating-toolbox__title-icon">
            <IconCategory width="20" />
          </span>
          <span class="vkedit-floating-toolbox__title-text">工具箱</span>
          <button class="vkedit-floating-toolbox__toggle" @click="toggleToolbox" title="收起工具箱">
            <IconChevronLeft width="16" />
          </button>
        </div>
        <div class="vkedit-floating-toolbox__content">
          <GraphicToolPanel :host="host" :collapsed="toolboxCollapsed">
            <template #toolbox>
              <slot name="toolbox" :host="host"></slot>
            </template>
          </GraphicToolPanel>
          <LayerPanel v-if="showLayers !== false" :host="host" class="vkedit-floating-toolbox__layers" />
        </div>
        <!-- 拖拽手柄 -->
        <div class="vkedit-floating-toolbox__resize-handle" @pointerdown="startResize" title="拖动调整侧边栏宽度"></div>
      </template>
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
          <IconChevronLeft v-if="propertyPanelCollapsed" width="16" />
          <IconChevronRight v-else width="16" />
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
        <IconSettings width="20" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from './Toolbar.vue' // 顶部区域
import GraphicToolPanel from './GraphicToolPanel.vue'
import StageView from './StageView.vue'
import PropertyPanel from './PropertyPanel.vue'
import { LayerPanel } from '@/plugins/layer-manager'
import IconMenu from '~icons/ph/list-light'
import IconCategory from '~icons/ph/squares-four-light'
import IconChevronLeft from '~icons/ph/caret-left-light'
import IconChevronRight from '~icons/ph/caret-right-light'
import IconSettings from '~icons/ph/gear-six-light'
import type { EditorHost } from '@/core'
import { onMounted, onUnmounted, ref } from 'vue'
import type { EditorLifecyclePayload } from '@/types'

const {
  host,
  showToolbox = true,
  showPropertyPanel = true,
  showToolbar = true,
  showLayers = true,
} = defineProps<{
  host: EditorHost
  showToolbox?: boolean
  showPropertyPanel?: boolean
  showToolbar?: boolean
  showLayers?: boolean
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

const toolboxWidth = ref(266)
const minWidth = 240
const maxWidth = 533
const resizing = ref(false)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

function startResize(evt: PointerEvent) {
  if (toolboxCollapsed.value) return
  evt.preventDefault()
  resizing.value = true
  resizeStartX.value = evt.clientX
  resizeStartWidth.value = toolboxWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('pointermove', onResizeMove)
  document.addEventListener('pointerup', endResize, { once: true })
}

function onResizeMove(evt: PointerEvent) {
  if (!resizing.value) return
  const delta = evt.clientX - resizeStartX.value
  const next = Math.max(minWidth, Math.min(maxWidth, resizeStartWidth.value + delta))
  toolboxWidth.value = next
}

function endResize() {
  if (!resizing.value) return
  resizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('pointermove', onResizeMove)
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
  if (!host) return
  host.on('stage:redraw', () => {
    // 强制更改key 以触发StageView重绘
    stageKey.value = `stage-${Date.now()}`
  })
  host.on('selection:changed', (data: { selection: any[] }) => {
    panelTitle.value = data.selection.length > 0 ? '元素属性' : '画布属性'
  })
  onResize()
  window.addEventListener('resize', onResize)
  const readyPayload: EditorLifecyclePayload = {
    timestamp: Date.now(),
    source: 'Editor.vue',
  }
  host.emit('editor:ready', readyPayload)
})

onUnmounted(() => {
  if (!host) {
    // host 缺失时安全跳过生命周期事件，但 resize 等监听器从未注册，无需清理
    return
  }
  const destroyPayload: EditorLifecyclePayload = {
    timestamp: Date.now(),
    source: 'Editor.vue',
  }
  host.emit('editor:destroy', destroyPayload)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('pointermove', onResizeMove)
  document.removeEventListener('pointerup', endResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
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
