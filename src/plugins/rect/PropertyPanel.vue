<template>
  <div class="text-xl font-bold pb-2">矩形属性</div>
  <div></div>
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
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { RectElement } from './rect-plugin'
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
  selection: RectElement[]
}

const { element, host, selection } = defineProps<Props>()
</script>

<style scoped></style>
