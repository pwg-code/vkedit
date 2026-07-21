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
import type { GraphicToolRegisteredEventData } from '@/plugins/graphic-manager/graphic-manager'
import type { GraphicToolManagerPlugin } from '@/plugins/graphic-tool-manager'

interface Props {
  host: EditorHost
  collapsed?: boolean
}

const { host, collapsed = false } = defineProps<Props>()

defineSlots<{
  toolbox?(props: { host: EditorHost }): any
}>()

const graphicToolPlugin = host.getPlugin('graphic-tool-manager-plugin') as GraphicToolManagerPlugin | undefined
const tools = ref<GraphicToolRegisteredEventData[]>([])

const initTools = () => {
  if (graphicToolPlugin?.getToolList) {
    tools.value = graphicToolPlugin.getToolList()
  }
}

const onToolRegistered = (data: GraphicToolRegisteredEventData) => {
  tools.value = [...tools.value, data]
}

const onToolUnregistered = (data: GraphicToolRegisteredEventData) => {
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