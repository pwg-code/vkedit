<template>
  <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
    <template v-for="graphicType in graphicTypesPlugin?.graphicTypes">
      <ElButton
        @click="
          graphicTypesPlugin?.onCreate(graphicType[0], {
            x: 50,
            y: 50,
          })
        "
      >
        {{ graphicType[1].name }}{{ graphicType[1].icon }}</ElButton
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ElButton } from 'element-plus'
import { GraphicTypesPlugin } from '@/plugins'

const { host } = defineProps<{
  host: IEditorHost
}>()

const graphicTypesPlugin = host.getPlugin<GraphicTypesPlugin>('graphic-types')
</script>
