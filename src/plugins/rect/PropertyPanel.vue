<template>
  <div class="">
    <div class="text-xl font-bold pb-2">矩形属性</div>
    <div>
      <NumberField
        :model-value="element.strokeWidth"
        :min="1"
        @update:model-value="
          (value) => element.updateProperty(host, 'strokeWidth', element.strokeWidth, value)
        "
      >
        <Label>边框粗细</Label>
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { RectElement } from './RectPlugin'
import { Label } from '@/components/ui/label'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

interface Props {
  host: IEditorHost
  element: RectElement
}

const { element, host } = defineProps<Props>()
</script>

<style scoped></style>
