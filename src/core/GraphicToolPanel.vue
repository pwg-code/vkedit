<template>
  <div>
    <div v-if="tools.length > 0" class="vkedit-graphic-tool__header">
      <span class="vkedit-graphic-tool__divider"></span>
      <span class="vkedit-graphic-tool__title">添加元素</span>
      <span class="vkedit-graphic-tool__divider"></span>
    </div>
    <div v-if="tools.length > 0" class="vkedit-graphic-tool__grid">
      <template v-for="tool in tools" :key="tool.type">
        <component :is="tool.render()" :host="host" :collapsed="collapsed" />
      </template>
    </div>
    <slot name="toolbox" :host="host"></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import type { GraphicToolEventData } from '@/types/event-data'

interface Props {
  host: EditorHost
  collapsed?: boolean
}

const { host, collapsed = false } = defineProps<Props>()

defineSlots<{
  toolbox?(props: { host: EditorHost }): any
}>()

const graphicRegistryPlugin = host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin | undefined
const tools = ref<GraphicToolEventData[]>([])

const initTools = () => {
  if (graphicRegistryPlugin?.getToolList) {
    tools.value = graphicRegistryPlugin.getToolList()
  }
}

const onToolRegistered = (data: GraphicToolEventData) => {
  tools.value = [...tools.value, data]
}

const onToolUnregistered = (data: GraphicToolEventData) => {
  tools.value = tools.value.filter((t) => t.type !== data.type)
}

onMounted(() => {
  initTools()
  host.on('graphic-tool:registered', onToolRegistered)
  host.on('graphic-tool:unregistered', onToolUnregistered)
})

onUnmounted(() => {
  host.off('graphic-tool:registered', onToolRegistered)
  host.off('graphic-tool:unregistered', onToolUnregistered)
})
</script>

<style scoped></style>