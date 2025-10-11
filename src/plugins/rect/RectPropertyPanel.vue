<template>
  <div class="">
    <div class="text-xl font-bold pb-2">矩形属性</div>
    <ElForm>
      <div class="pt-5">位置</div>
      <ElDivider></ElDivider>
      <ElFormItem label="X">
        <ElInputNumber
          label="X"
          :model-value="element.x"
          @change="(value) => updateProperty('x', value)"
        />
      </ElFormItem>
      <ElFormItem label="Y">
        <ElInputNumber
          label="Y"
          :model-value="element.y"
          @change="(value) => updateProperty('y', value)"
        />
      </ElFormItem>
      <div class="pt-5">尺寸</div>
      <ElDivider></ElDivider>

      <ElFormItem label="宽度">
        <ElInputNumber
          :model-value="element.width"
          @change="(value) => updateProperty('width', value)"
        />
      </ElFormItem>
      <ElFormItem label="高度">
        <ElInputNumber
          :model-value="element.height"
          @change="(value) => updateProperty('height', value)"
        />
      </ElFormItem>
      <ElFormItem label="角度">
        <ElInputNumber
          :model-value="element.rotation"
          :step="1"
          :min="0"
          :max="360"
          @change="(value: any) => updateProperty('rotation', value)"
        ></ElInputNumber>
      </ElFormItem>
      <div class="pt-5">边框</div>
      <ElDivider></ElDivider>

      <ElFormItem label="边框粗细">
        <ElInputNumber
          :model-value="element.strokeWidth"
          :min="1"
          @change="(value) => updateProperty('strokeWidth', value)"
        />
      </ElFormItem>
      <ElFormItem label="边框颜色">
        <ElColorPicker
          :model-value="element.stroke"
          @change="(value: any) => updateProperty('stroke', value)"
        />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { RectElement } from './RectPlugin'
import { ElDivider, ElInputNumber, ElColorPicker, ElForm, ElFormItem } from 'element-plus'
import { UpdatePropertyCommand } from '@/commands'

interface Props {
  host: IEditorHost
  element: RectElement
}

const { element, host } = defineProps<Props>()

const updateProperty = (property: string, value: any) => {
  // 这里应该通过host的命令系统执行更新
  if (property in element) {
    host.executeCommand(
      new UpdatePropertyCommand(element, host, property, element[property], value),
    )
  }
  // 发送属性更新事件
  host.emit('element:property-updated', {
    element: element,
    property,
    value,
  })
}
</script>

<style scoped></style>
