<template>
  <div class="">
    <div class="text-xl font-bold pb-2">文本属性</div>
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
      <div class="pt-5">字体</div>
      <ElDivider></ElDivider>

      <ElFormItem label="字号">
        <ElInputNumber
          :model-value="element.fontSize"
          :min="4"
          @change="(value) => updateProperty('fontSize', value)"
        />
      </ElFormItem>
      <ElFormItem label="缩放">
        <ElInputNumber
          :model-value="element.scaleX"
          :step="0.1"
          :min="0.5"
          @change="(value: any) => updateProperty('scaleX', value)"
        ></ElInputNumber>
        <ElInputNumber
          :model-value="element.scaleY"
          :step="0.1"
          :min="0.5"
          @change="(value: any) => updateProperty('scaleY', value)"
        ></ElInputNumber>
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
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { TextElement } from './TextPlugin'
import { ElDivider, ElInputNumber, ElColorPicker, ElForm, ElFormItem } from 'element-plus'
import { UpdatePropertyCommand } from '@/commands'

interface Props {
  host: IEditorHost
  element: TextElement
}

const { element, host } = defineProps<Props>()

const updateProperty = (property: string, value: any) => {
  // 这里应该通过host的命令系统执行更新
  if (property in element) {
    host.executeCommand(
      new UpdatePropertyCommand(element, host, property, element[property], value),
    )
  }
}
</script>

<style scoped></style>
