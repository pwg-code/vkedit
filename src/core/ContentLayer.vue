<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- <v-rect :config="contentBgConfig"></v-rect> -->
    <v-group :config="contentGroupConfig" ref="groupRef">
      <!-- 事件会导致卡顿 考虑优化？  拖拽 变化时 移动到临时图层进行处理 -->
      <component
        v-for="element in elements"
        :key="element.id"
        :is="host.getPlugin('graphic-manager-plugin')?.getElementComponent(element.type)"
        :element="element"
        :host="host"
        @dragend="handleDragEnd($event, element)"
        @transformend="handleElementTransformEnd($event, element)"
        @transform="handleElementTransform($event, element)"
      />
      <v-transformer ref="transformerRef"></v-transformer>
    </v-group>
    <slot></slot>
  </v-layer>
</template>

<script setup lang="ts">
import { useContentLayer } from '@/hooks/use-content-layer'
import { type EditorHost } from '@/core'
import { onMounted, ref } from 'vue'

const { host } = defineProps<{ host: EditorHost }>()

const groupRef = ref()

// 内容图层
const {
  contentLayerConfig,
  contentLayerRef,
  transformerRef,
  contentGroupConfig,
  elements,
  handleDragEnd,
  handleElementTransform,
  handleElementTransformEnd,
  initElements,
  updateTransformerNodes,
  updateCanvas,
} = useContentLayer(host)

onMounted(() => {
  // 添加或删除图形时触发更新elements
  host.on('element:removed', initElements)
  host.on('element:added', initElements)
  // 选中变更事件
  host.on('selection:changed', (data) => updateTransformerNodes(data.selection))
  host.on('element:transformed', initElements)
  host.on('element:updated', updateCanvas)
  host.on('elements:align', updateCanvas)

  // 将内容图层赋值给宿主  以便其他插件使用
  host.contentLayer = contentLayerRef.value
  host.contentGroup = groupRef.value
})
</script>

<style scoped></style>
