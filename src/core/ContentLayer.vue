<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- 内容区底板 -->
    <!-- 图形区域组 -->

    <v-rect :config="contentBgConfig"></v-rect>
    <v-group :config="contentGroupConfig" ref="groupRef">
      <!-- 事件会导致卡顿 考虑优化？  拖拽 变化时 移动到临时图层进行处理 -->
      <component
        v-for="element in elements"
        :key="element.id"
        :is="graphicTypesPlugin?.getElementComponent(element.type)"
        :element="element"
        :host="host"
        @transformend="handleElementTransformEnd($event, element)"
        @dragend="handleDragEnd($event, element)"
        @transform="handleElementTransform($event, element)"
      />

      <v-transformer ref="transformerRef" :config="{}"></v-transformer>
    </v-group>
    <slot></slot>
  </v-layer>
</template>

<script setup lang="ts">
import useContentLayer from '@/hooks/use-content-layer'
import { TextElement, type ElementsPlugin } from '@/plugins'
import type { IEditorHost } from '@/types'
import { onMounted, ref } from 'vue'

const { host } = defineProps<{ host: IEditorHost }>()

const groupRef = ref()

// 内容图层
const {
  contentLayerConfig,
  contentLayerRef,
  transformerRef,
  contentBgConfig,
  contentGroupConfig,
  elements,
  graphicTypesPlugin,
  handleDragEnd,
  handleElementTransform,
  handleElementTransformEnd,
} = useContentLayer(host)
</script>

<style scoped></style>
