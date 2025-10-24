<template>
  <div class="text-xl font-bold pb-2">基础属性</div>
  <div></div>
  <!-- <div class="grid grid-cols-2 gap-4 items-center py-3"> -->
  <div>
    <Label>X</Label>
    <NumberField
      :model-value="element.x"
      :min="0"
      @update:model-value="(value: any) => updateProperty('x', element.x, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>Y</Label>
    <NumberField
      :model-value="element.y"
      :min="0"
      @update:model-value="(value: any) => updateProperty('y', element.y, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>宽</Label>
    <NumberField
      :model-value="element.width"
      :min="0"
      @update:model-value="(value: any) => updateProperty('width', element.width, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>高</Label>
    <NumberField
      :model-value="element.height"
      :min="0"
      @update:model-value="(value: any) => updateProperty('height', element.height, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>缩放X</Label>
    <NumberField
      :model-value="element.scaleX"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => updateProperty('scaleX', element.scaleX, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>缩放Y</Label>
    <NumberField
      :model-value="element.scaleY"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => updateProperty('scaleY', element.scaleY, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>角度</Label>
    <NumberField
      :model-value="element.rotation"
      :min="0"
      :max="359"
      @update:model-value="(value: any) => updateProperty('rotation', element.rotation, value)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div></div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement, IEditorHost } from '@/types'
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
  element: BaseGraphicElement
}

const { element, host } = defineProps<Props>()

const updateProperty = (property: string, oldValue: any, newValue: any) => {
  element.updateProperty(host, property, oldValue, newValue)
  // 处理多选的情况.....
}
</script>

<style scoped></style>
