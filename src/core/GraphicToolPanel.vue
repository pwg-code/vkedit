<template>
  <div>
    <div v-if="tools.length > 0" class="vkedit-graphic-tool__header">
      <span class="vkedit-graphic-tool__divider"></span>
      <span class="vkedit-graphic-tool__title">添加元素</span>
      <span class="vkedit-graphic-tool__divider"></span>
    </div>
    <div v-if="tools.length > 0" class="vkedit-graphic-tool__grid">
      <GraphicToolRenderer
        v-for="tool in tools"
        :key="tool.type"
        :type="tool.type"
        :icon-component="tool.iconComponent"
        :type-display-name="tool.typeDisplayName"
        :create-element="tool.createElement"
        :host="host"
        :collapsed="collapsed"
      />
    </div>
    <slot name="toolbox" :host="host"></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { EditorHost } from '@/core'
import type { GraphicRegistryPlugin, ToolDescriptor } from '@/plugins/graphic-registry'
import GraphicToolRenderer from './GraphicToolRenderer.vue'

interface Props {
  host: EditorHost
  collapsed?: boolean
}

const { host, collapsed = false } = defineProps<Props>()

defineSlots<{
  toolbox?(props: { host: EditorHost }): any
}>()

const graphicRegistryPlugin = host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin | undefined
const tools = shallowRef<ToolDescriptor[]>([])

const initTools = () => {
  if (graphicRegistryPlugin?.getToolList) {
    tools.value = graphicRegistryPlugin.getToolList()
  }
}

const onToolRegistered = (_data: unknown) => {
  initTools()
}

const onToolUnregistered = (_data: unknown) => {
  initTools()
}

onMounted(() => {
  initTools()
  host.on('graphic:registered', onToolRegistered)
  host.on('graphic:unregistered', onToolUnregistered)
})

onUnmounted(() => {
  host.off('graphic:registered', onToolRegistered)
  host.off('graphic:unregistered', onToolUnregistered)
})
</script>

<style scoped></style>
