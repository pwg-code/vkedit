<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- <v-rect :config="contentBgConfig"></v-rect> -->
    <v-group :config="contentGroupConfig" ref="groupRef">
      <!-- 事件会导致卡顿 考虑优化？  拖拽 变化时 移动到临时图层进行处理 -->
      <template v-for="element in elements" :key="element.id">
        <component
          v-if="element.visible"
          :is="host.getPlugin('graphic-registry-plugin')?.getElementComponent(element.type)"
          :element="element"
          :host="host"
        />
      </template>
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
  contentGroupConfig,
  elements,
  initElements,
  updateCanvas,
} = useContentLayer(host)

onMounted(() => {
  initElements()
  // 添加或删除图形时触发更新elements
  host.on('element:removed', initElements)
  host.on('element:added', initElements)
  host.on('element:transformed', initElements)
  host.on('element:updated', updateCanvas)
  host.on('element:visibility-change', updateCanvas)
  host.on('elements:align', updateCanvas)
  host.on('elements:distribute', updateCanvas)
  // 层级变更事件：单元素上移/下移/置顶/置底 + 拖拽批量重排
  host.on('layer:order-changed', initElements)

  // 将内容图层赋值给宿主  以便其他插件使用
  host.contentLayer = contentLayerRef.value
  host.contentGroup = groupRef.value
})
</script>

<style scoped></style>
