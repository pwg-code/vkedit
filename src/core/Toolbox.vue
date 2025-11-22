<template>
  <div class="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <template v-for="tool in graphicToolPlugin.getToolList()" :key="tool.type">
      <component :is="tool.render()" :host="host" :tool="tool"></component>
      <slot name="toolbox" :host="host"></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'

const { host } = defineProps<{
  host: EditorHost
}>()

const graphicToolPlugin = host.getPlugin('graphic-tool-manager-plugin')
</script>
