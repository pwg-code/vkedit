<template>
  <div class="flex-2 border-[0.5px] border-gray-200 p-5">
    <!-- 如果有选择的元素则获取元素提供的面板 否则显示画布设置 -->
    <template v-if="activeElement">
      <component
        :is="propertyPanelsPlugin?.getPanel(activeElement?.type || '')"
        :element="activeElement"
        :host="host"
      ></component>
    </template>
    <template v-else>
      <div class="text-xl font-bold pb-2">画布属性</div>
      <ElForm>
        <div class="pt-5">尺寸</div>
        <ElDivider></ElDivider>

        <ElFormItem label="宽度">
          <ElInputNumber v-model="hostState.width" />
        </ElFormItem>
        <ElFormItem label="高度">
          <ElInputNumber v-model="hostState.height" />
        </ElFormItem>
      </ElForm>
    </template>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Component } from 'vue'
import type { IEditorHost, IGraphicElement } from '../types'
import { EditorEvents } from '@/types/EventTypes'
import { ElForm, ElFormItem, ElInputNumber, ElDivider } from 'element-plus'
import type { PropertyPanelsPlugin } from '@/plugins/PropertyPanelsPlugin'
const { host } = defineProps<{ host: IEditorHost }>()
const hostState = ref(host.getState())

const propertyPanelsPlugin = host.getPlugin<PropertyPanelsPlugin>('property-panels')
const activeElement = ref<IGraphicElement>()

// 更新属性设置面板
const updateSettings = (selection: Map<string, IGraphicElement>) => {
  // 如果插件提供了组件则使用组件  否则显示基本长宽设置
  activeElement.value = undefined
  if (selection.size !== 1) return
  activeElement.value = selection.entries().next().value?.[1]
}

onMounted(() => {
  // 动态渲染属性面板
  host.on(EditorEvents.SELECTION_CHANGED, updateSettings)
})
</script>

<style scoped></style>
