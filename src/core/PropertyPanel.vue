<template>
  <div class="flex-2 p-5 bg-card grid grid-cols-1 xl:grid-cols-2 gap-4">
    <template v-for="item in panels">
      <component :is="item" :host="host" :selection="selectionElement" :element="element" />
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
import { EditorEvents } from '@/types/event-types'
import type { PropertyPanelManagerPlugin } from '@/plugins/property-panel-manager'
const { host } = defineProps<{ host: IEditorHost }>()
const hostState = ref(host.getState())

const propertyPanelsPlugin = host.getPlugin<PropertyPanelManagerPlugin>(
  'property-panel-manager-plugin',
)
const selectionElement = ref<IGraphicElement[]>([])
const element = ref<IGraphicElement>()

const panels = ref<Component[]>()

// 更新属性设置面板
const updatePanels = (selection: Map<string, IGraphicElement>) => {
  selectionElement.value = Array.from(selection.values())
  if (selectionElement.value.length > 0) {
    element.value = selectionElement.value[0]
  }
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
