<template>
  <div class="vkedit-property__col-full">条码属性</div>
  <div class="vkedit-property__col-full">
    <label class="vkedit-property__label">格式</label>
    <VkSelect :model-value="element.format" @update:model-value="onFormatChange">
      <option value="CODE128">CODE128</option>
      <option value="EAN13">EAN13</option>
      <option value="UPC">UPC</option>
      <option value="CODE39">CODE39</option>
      <option value="ITF">ITF</option>
    </VkSelect>
  </div>
  <div>
    <VkLabel>内容</VkLabel>
    <VkInput :model-value="element.content" @update:model-value="onContentChange"> </VkInput>
  </div>
  <div>
    <label class="vkedit-property__label">可见性</label>
    <VkSwitch :model-value="element.displayValue" @update:model-value="onDisplayValueUpdate" />
  </div>
  <div>
    <label class="vkedit-property__label">高度</label>
    <VkInputNumberMM
      :min="1"
      :model-value="element.barcodeHeightMM"
      @update:model-value="(value) => batchUpdateProperty(selection, 'barcodeHeightMM', value)"
    />
  </div>
  <div>
    <label class="vkedit-property__label">宽度(条纹)</label>
    <VkInputNumberMM
      :min="0.1"
      :model-value="element.barcodeWidthMM"
      :step="0.01"
      @update:model-value="(value) => batchUpdateProperty(selection, 'barcodeWidthMM', value)"
    />
  </div>
  <div>
    <VkLabel>角度</VkLabel>
    <VkInputNumber
      :model-value="element.rotation"
      @update:model-value="(value) => batchUpdateProperty(selection, 'rotation', value)"
    >
    </VkInputNumber>
  </div>
  <div>
    <label class="vkedit-property__label">留白</label>
    <VkInputNumberMM
      :min="0"
      :model-value="element.marginMM"
      @update:model-value="(value) => batchUpdateProperty(selection, 'marginMM', value)"
    >
    </VkInputNumberMM>
  </div>
  <div>
    <label class="vkedit-property__label">字体大小</label>
    <VkInputNumberMM :model-value="element.fontSizeMM" @update:model-value="onFontSizeMMUpdate" />
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { BarcodeElement } from './barcode'
import { usePropertyCommand } from '@/hooks'
import {
  VkInputNumberMM,
  VkInput,
  VkLabel,
  VkSelect,
  VkSwitch,
  VkInputNumber,
} from '@/components/ui'

interface Props {
  host: EditorHost
  element: BarcodeElement
  selection: BarcodeElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

function onContentChange(value: any) {
  batchUpdateProperty(selection, 'content', value)
}

function onFormatChange(value: any) {
  batchUpdateProperty(selection, 'format', value)
}

function onFontSizeMMUpdate(value: any) {
  batchUpdateProperty(selection, 'fontSizeMM', value)
}
function onDisplayValueUpdate(value: any) {
  batchUpdateProperty(selection, 'displayValue', value)
}
</script>

<style scoped></style>
