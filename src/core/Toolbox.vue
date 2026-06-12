<template>
  <div class="vkedit-toolbox">
    <div class="vkedit-toolbox__content">
      <template v-for="tool in graphicToolPlugin.getToolList()" :key="tool.type">
        <component :is="tool.render()" :host="host" :tool="tool" :collapsed="collapsed"></component>
        <slot name="toolbox" :host="host"></slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'

const { host, collapsed = false } = defineProps<{
  host: EditorHost
  collapsed?: boolean
}>()

const graphicToolPlugin = host.getPlugin('graphic-tool-manager-plugin')
</script>
