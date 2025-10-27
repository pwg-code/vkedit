<template>
  <div class="flex-2 p-5 bg-card grid grid-cols-1 xl:grid-cols-2 gap-4">
    <template v-for="item in panels">
      <component :is="item" :element="activeElement" :host="host" />
    </template>
    <slot name="property-panel" :host="host"></slot>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, type Component } from 'vue'
import type {
  IEditorHost,
  IGraphicElement,
  IPropertyPanel,
  IPropertyPanelForGraphics,
} from '../types'
import { EditorEvents } from '@/types/EventTypes'
import type { PropertyPanelsPlugin } from '@/plugins/PropertyPanelsPlugin'
const { host } = defineProps<{ host: IEditorHost }>()
const hostState = ref(host.getState())

const propertyPanelsPlugin = host.getPlugin<PropertyPanelsPlugin>('property-panels')
const activeElement = ref<IGraphicElement>()

const panels = ref<Component[]>()

// 更新属性设置面板
const updatePanels = (selection: Map<string, IGraphicElement>) => {
  // 如果插件提供了组件则使用组件  否则显示基本长宽设置
  activeElement.value = undefined
  // if (selection.size !== 1) return
  activeElement.value = selection.entries().next().value?.[1]
  let currentPanels: Component[] = []
  if (selection.size > 0) {
    currentPanels = propertyPanelsPlugin?.getPanelsBySelection(selection) || []
  } else {
    currentPanels = propertyPanelsPlugin?.getCanvasPanels() || []
  }
  // 使用markRaw 防止监控组件响应
  panels.value = currentPanels.map((p) => markRaw(p))
}

onMounted(() => {
  // 动态渲染属性面板
  host.on(EditorEvents.SELECTION_CHANGED, updatePanels)
})
</script>

<style scoped></style>
