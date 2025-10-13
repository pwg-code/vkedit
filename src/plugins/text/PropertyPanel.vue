<template>
  <div class="">
    <div class="text-xl font-bold pb-2">文本属性</div>
    <ElForm>
      <div class="pt-5">字体</div>
      <ElDivider></ElDivider>
      <ElFormItem label="字号">
        <ElInputNumber
          :model-value="element.fontSize"
          :min="4"
          @change="(value) => element.updateProperty(host, 'fontSize', element.fontSize, value)"
        />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { TextElement } from './TextPlugin'
import { ElDivider, ElInputNumber, ElColorPicker, ElForm, ElFormItem } from 'element-plus'

interface Props {
  host: IEditorHost
  element: TextElement
}

const { element, host } = defineProps<Props>()
</script>

<style scoped></style>
