<template>
  <div class="vkedit-property__title">线条属性</div>
  <div></div>
  <div>
    <Label>粗细</Label>
    <VkInputNumberMM
      :model-value="element.hmm"
      :min="0"
      @update:model-value="(value) => batchUpdateProperty(selection, 'hmm', value)"
    >
    </VkInputNumberMM>
  </div>
  <div>
    <Label>长度</Label>
    <VkInputNumberMM
      :model-value="element.wmm"
      :min="1"
      @update:model-value="(value) => batchUpdateProperty(selection, 'wmm', value)"
    >
    </VkInputNumberMM>
  </div>
  <div>
    <Label>角度</Label>
    <VkInputNumber
      :model-value="element.rotation"
      @update:model-value="(value) => batchUpdateProperty(selection, 'rotation', value)"
    >
    </VkInputNumber>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { LineElement } from './line'
import { VkLabel, VkInputNumber, VkInputNumberMM } from '@/components/ui'
import { usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: LineElement
  selection: LineElement[]
}
const { element, host, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)
</script>

<style scoped></style>
