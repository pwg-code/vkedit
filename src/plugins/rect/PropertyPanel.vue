<template>
  <div class="text-xl font-bold pb-2">矩形属性</div>
  <div></div>
  <div>
    <Label>边框粗细</Label>
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
import { Label } from '@/components/ui/label'
import { VkInputNumberMM } from '@/components/ui'
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
