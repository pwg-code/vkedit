<template>
  <div class="vkedit-property__title">基础属性</div>
  <div></div>
  <!-- <div class="grid grid-cols-2 gap-4 items-center py-3"> -->
  <div>
    <VkLabel>X</VkLabel>
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
    <VkLabel>Y</VkLabel>
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
    <VkLabel>宽</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.width"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'width', value)"
    ></VkInputMM>
  </div>

  <div>
    <VkLabel>高</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.height"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'height', value)"
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>缩放X</VkLabel>
    <VkInputNumber
      :model-value="element.scaleX"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleX', value)"
    />
  </div>
  <div>
    <VkLabel>缩放Y</VkLabel>
    <VkInputNumber
      :model-value="element.scaleY"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleY', value)"
    />
  </div>
  <div>
    <VkLabel>角度</VkLabel>
    <VkInputNumber
      :model-value="element.rotation"
      :min="0"
      :max="359"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'rotation', value)"
    />
  </div>
  <div></div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement } from '@/types'
import type { EditorHost } from '@/core'
import { VkInputMM, VkInputNumber, VkLabel } from '@/components/ui'
import { useHostState, usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: BaseGraphicElement
  selection: BaseGraphicElement[]
}

const { element, host, selection } = defineProps<Props>()

const { hostState } = useHostState(host)

const { updateProperty, batchUpdateProperty } = usePropertyCommand(host)
</script>

<style scoped></style>
