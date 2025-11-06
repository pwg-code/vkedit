<template>
  <div class="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <template v-for="graphicType in graphicTypes">
      <component
        :is="graphicType.renderTool()"
        @click="handleClick(graphicType)"
        :host="host"
        :graphicType="graphicType"
      ></component>
      <slot name="toolbox" :host="host"></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost, IGraphicType } from '@/types'
import { ElementManagerPlugin, GraphicTypeManagerPlugin } from '@/plugins'
import { onMounted, ref } from 'vue'
import { AddElementCommand } from '@/commands'

const { host } = defineProps<{
  host: IEditorHost
}>()

const graphicTypesPlugin = host.getPlugin<GraphicTypeManagerPlugin>('graphic-type-manager-plugin')

// 活动元素管理插件
const elementsPlugin = host.getPlugin<ElementManagerPlugin>('element-manager-plugin')

const graphicTypes = ref(graphicTypesPlugin?.getGraphicTypes())

function handleClick(graphicType: IGraphicType) {
  const newElement = graphicType.createElement(50, 50)
  // 使用命令系统创建元素
  host.executeCommand(new AddElementCommand(newElement, host))
}
</script>
