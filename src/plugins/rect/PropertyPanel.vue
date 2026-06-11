<template>
  <div class="vkedit-property__title">矩形属性</div>
  <div></div>
  <div>
    <VkLabel>边框粗细</VkLabel>
    <VkInputNumberMM
      :model-value="element.strokeWidthMM"
      :min="1"
      @update:model-value="(value) => batchUpdateProperty(selection, 'strokeWidthMM', value)"
    >
    </VkInputNumberMM>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { RectElement } from './rect'
import { VkLabel, VkInputNumberMM } from '@/components/ui'
import { usePropertyCommand } from '@/hooks/use-property-command'

interface Props {
  host: EditorHost
  element: RectElement
  selection: RectElement[]
}

const { element, host, selection } = defineProps<Props>()

const { batchUpdateProperty } = usePropertyCommand(host)
</script>

<style scoped></style>
