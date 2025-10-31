<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- 内容区底板 -->
    <!-- 图形区域组 -->

    <!-- <v-rect :config="contentBgConfig"></v-rect> -->
    <v-group :config="contentGroupConfig" ref="groupRef">
      <!-- 事件会导致卡顿 考虑优化？  拖拽 变化时 移动到临时图层进行处理 -->
      <component
        v-for="element in elements"
        :key="element.id"
        :is="graphicTypesPlugin?.getElementComponent(element.type)"
        :element="element"
        :host="host"
        @dragend="handleDragEnd($event, element)"
        @mousedown="(e:any)=>e.cancelBubble = true"
        @transformend="handleElementTransformEnd($event, element)"
        @transform="handleElementTransform($event, element)"
        />
        <!-- @mousemove="(e:any)=>e.cancelBubble = true" -->
        <!-- @mouseup="(e:any)=>e.cancelBubble = true" -->
        <!-- @click="(e:any)=>e.cancelBubble = true" -->
        <!-- @wheel="(e:any)=>e.cancelBubble = true" -->

      <v-transformer ref="transformerRef"></v-transformer>
    </v-group>
    <slot></slot>
  </v-layer>
</template>

<script setup lang="ts">
import useContentLayer from '@/hooks/use-content-layer'
import { TextElement, type ElementsPlugin } from '@/plugins'
import { EditorEvents, type IEditorHost } from '@/types'
import { onMounted, ref } from 'vue'

const { host } = defineProps<{ host: IEditorHost }>()

const groupRef = ref()

// 内容图层
const {
  contentLayerConfig,
  contentLayerRef,
  transformerRef,
  contentGroupConfig,
  elements,
  graphicTypesPlugin,
  handleDragEnd,
  handleElementTransform,
  handleElementTransformEnd,
  initElements,
  updateTransformerNodes,
  updateCanvas,
} = useContentLayer(host)

onMounted(() => {
  // 添加或删除图形时触发更新elements
  host.on(EditorEvents.ELEMENT_REMOVED, initElements)
  host.on(EditorEvents.ELEMENT_ADDED, initElements)

  // 选中变更事件
  host.on(EditorEvents.SELECTION_CHANGED, updateTransformerNodes)
  host.on(EditorEvents.ELEMENT_TRANSFORMED, initElements)
  host.on(EditorEvents.ELEMENT_UPDATED, updateCanvas)
  host.on(EditorEvents.PROPERTY_VALUE_CHANGE, updateCanvas)
  host.on(EditorEvents.ELEMENTS_ALIGN, updateCanvas)

  // 将内容图层赋值给宿主  以便其他插件使用
  host.layer = contentLayerRef.value
})
</script>

<style scoped></style>
