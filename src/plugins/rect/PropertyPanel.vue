<template>
  <div class="">
    <div class="text-xl font-bold pb-2">矩形属性</div>
    <ElForm>
      <div class="pt-5">边框</div>
      <ElDivider></ElDivider>
      <ElFormItem label="边框粗细">
        <ElInputNumber
          :model-value="element.strokeWidth"
          :min="1"
          @change="
            (value) => element.updateProperty(host, 'strokeWidth', element.strokeWidth, value)
          "
        />
      </ElFormItem>
      <ElFormItem label="边框颜色">
        <ElColorPicker
          :model-value="element.stroke"
          @change="(value: any) => element.updateProperty(host, 'stroke', element.stroke, value)"
        />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { RectElement } from './RectPlugin'
import { ElDivider, ElInputNumber, ElColorPicker, ElForm, ElFormItem } from 'element-plus'

interface Props {
  host: IEditorHost
  element: RectElement
}

const { element, host } = defineProps<Props>()
</script>

<style scoped></style>
