<template>
  <div class="text-xl font-bold py-2">文本属性</div>
  <div></div>
  <div>
    <Label>文本</Label>
    <Input
      :model-value="element.text"
      @update:model-value="(value) => element.updateProperty(host, 'text', element.text, value)"
    ></Input>
  </div>
  <div>
    <Label>字号</Label>
    <NumberField
      :model-value="element.fontSize"
      :min="1"
      @update:model-value="
        (value) => element.updateProperty(host, 'fontSize', element.fontSize, value)
      "
    >
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
import type { TextElement } from './text-plugin'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

interface Props {
  host: IEditorHost
  element: TextElement
  selection: TextElement[]
}

const { element, host, selection } = defineProps<Props>()
</script>

<style scoped></style>
