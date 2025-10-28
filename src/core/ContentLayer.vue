<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- 内容区底板 -->
    <!-- 图形区域组 -->

    <v-rect :config="contentBgConfig"></v-rect>
    <v-group :config="contentGroupConfig">
      <component
        v-for="element in elements"
        :key="element.id"
        :is="graphicTypesPlugin?.getElementComponent(element.type)"
        :element="element"
        :host="host"
        @transform="handleElementTransform($event, element)"
        @transformend="handleElementTransformEnd($event, element)"
        @dragend="handleDragEnd($event, element)"
      />
      <v-transformer ref="transformerRef" :config="{}"></v-transformer>
    </v-group>
    <slot></slot>
  </v-layer>
</template>

<script setup lang="ts">
import useContentLayer from '@/hooks/useContentLayer'
import type { IEditorHost } from '@/types'

const { host } = defineProps<{ host: IEditorHost }>()

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
