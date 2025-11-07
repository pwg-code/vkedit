<template>
  <div class="text-xl font-bold pb-2">基础属性</div>
  <div></div>
  <!-- <div class="grid grid-cols-2 gap-4 items-center py-3"> -->
  <div>
    <Label>X</Label>
    <VkInputMM
      :step="0.1"
      :model-value="element.x"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          updateProperty(element, 'x', value)
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <Label>Y</Label>
    <VkInputMM
      :step="0.1"
      :model-value="element.y"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          updateProperty(element, 'y', value)
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <Label>宽</Label>
    <VkInputMM
      :step="0.1"
      :model-value="element.width"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'width', value)"
    ></VkInputMM>
  </div>

  <div>
    <Label>高</Label>
    <VkInputMM
      :step="0.1"
      :model-value="element.height"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'height', value)"
    ></VkInputMM>
  </div>
  <div>
    <Label>缩放X</Label>
    <NumberField
      :model-value="element.scaleX"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleX', value)"
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
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleY', value)"
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
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'rotation', value)"
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
import { useHostState, usePropertyCommand } from '@/hooks'
import { VkInputMM } from './ui'

interface Props {
  host: IEditorHost
  element: BaseGraphicElement
  selection: BaseGraphicElement[]
}

const { element, host, selection } = defineProps<Props>()

const { hostState } = useHostState(host)

const { updateProperty, batchUpdateProperty } = usePropertyCommand(host)
</script>

<style scoped></style>
