<template>
  <div class="vkedit-floating-property-panel__content">
    <template v-for="item in panels">
      <component :is="item" :host="host" :selection="selectionElement" :element="element" />
    </template>
    <slot name="property-panel" :host="host"></slot>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onMounted, ref, type Component } from 'vue'
import type { IGraphicElement } from '@/types'
import type { PropertyPanelManagerPlugin } from '@/plugins/property-panel-manager/property-panel-manager'
import type { EditorHost } from '@/core'
const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

const propertyPanelsPlugin = host.getPlugin('property-panel-manager-plugin')
const selectionElement = ref<IGraphicElement[]>([])
const element = ref<IGraphicElement>()

const panels = ref<Component[]>()

const updatePanels = (selection: IGraphicElement[]) => {
  selectionElement.value = selection
  if (selectionElement.value.length > 0) {
    element.value = selectionElement.value[0]
  }
  let currentPanels: Component[] = []
  if (selection.length > 0) {
    currentPanels = propertyPanelsPlugin.getPanelsBySelection(selection) || []
  } else {
    currentPanels = propertyPanelsPlugin.getCanvasPanels() || []
  }
  panels.value = currentPanels.map((p) => markRaw(p))
}

const initPanel = () => {
  const selectionPlugin = host.getPlugin('selection-plugin') as any
  const selection = selectionPlugin?.getSelectionElements() ?? []
  updatePanels(selection)
}

onMounted(() => {
  initPanel()
  host.on('selection:changed', (data) => updatePanels(data.selection))
})
</script>

<style scoped></style>
