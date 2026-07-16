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
  <div class="vkedit-property__col-full">
    <VkColorPicker
      :model-value="element.stroke"
      label="边框颜色"
      @update:model-value="(value) => batchUpdateProperty(selection, 'stroke', value ?? '#000000')"
    />
  </div>
  <div class="vkedit-property__col-full">
    <VkColorPicker
      :model-value="isNoneFill ? null : element.fill"
      label="填充颜色"
      :allow-none="true"
      @update:model-value="(value) => handleFillChange(value)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EditorHost } from '@/core'
import type { RectElement } from './rect'
import { VkLabel, VkInputNumberMM, VkColorPicker } from '@/components/ui'
import { usePropertyCommand } from '@/hooks/use-property-command'

interface Props {
  host: EditorHost
  element: RectElement
  selection: RectElement[]
}

const { element, host, selection } = defineProps<Props>()

const { batchUpdateProperty } = usePropertyCommand(host)

// 旧模板或空 fill 字符串均视为无填充
const isNoneFill = computed(() => !element.fill || element.fill === '')

function handleFillChange(value: string | null) {
  if (value === null) {
    batchUpdateProperty(selection, 'fill', '')
  } else {
    batchUpdateProperty(selection, 'fill', value)
  }
}
</script>

<style scoped></style>