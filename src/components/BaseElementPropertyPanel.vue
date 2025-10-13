<template>
  <div class="text-xl font-bold pb-2">基础属性</div>
  <ElForm>
    <div class="pt-5">位置</div>
    <ElDivider></ElDivider>
    <ElFormItem label="X">
      <ElInputNumber
        label="X"
        :model-value="element.x"
        @input="(value) => updateProperty('x', element.x, value)"
      />
    </ElFormItem>
    <ElFormItem label="Y">
      <ElInputNumber
        label="Y"
        :model-value="element.y"
        @input="(value) => updateProperty('y', element.y, value)"
      />
    </ElFormItem>
    <div class="pt-5">尺寸</div>
    <ElDivider></ElDivider>

    <ElFormItem label="宽度">
      <ElInputNumber
        :model-value="element.width"
        @input="(value) => updateProperty('width', element.width, value)"
      />
    </ElFormItem>
    <ElFormItem label="高度">
      <ElInputNumber
        :model-value="element.height"
        @input="(value) => updateProperty('height', element.height, value)"
      />
    </ElFormItem>
    <ElFormItem label="角度">
      <ElInputNumber
        :model-value="element.rotation"
        :step="1"
        :min="0"
        :max="360"
        @input="(value: any) => updateProperty('rotation', element.rotation, value)"
      ></ElInputNumber>
    </ElFormItem>

    <ElFormItem label="缩放">
      <ElInputNumber
        :model-value="element.scaleX"
        :step="0.1"
        :min="0.5"
        @input="(value: any) => updateProperty('scaleX', element.scaleX, value)"
      ></ElInputNumber>
      <ElInputNumber
        :model-value="element.scaleY"
        :step="0.1"
        :min="0.5"
        @input="(value: any) => updateProperty('scaleY', element.scaleY, value)"
      ></ElInputNumber>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
import type { BaseGraphicElement, IEditorHost } from '@/types'
import { ElDivider, ElInputNumber, ElColorPicker, ElForm, ElFormItem } from 'element-plus'

interface Props {
  host: IEditorHost
  element: BaseGraphicElement
}

const { element, host } = defineProps<Props>()

const updateProperty = (property: string, oldValue: any, newValue: any) => {
  element.updateProperty(host, property, oldValue, newValue)
  // 处理多选的情况.....
}
</script>

<style scoped></style>
