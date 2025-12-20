<template>
  <div class="col-span-full">条码属性</div>
  <div class="col-span-full">
    <label class="block text-sm text-gray-600">格式</label>
    <VkSelect :model-value="element.format" @update:model-value="onFormatChange">
      <VkSelectTrigger class="w-full">
        <VkSelectValue placeholder="选择格式" />
      </VkSelectTrigger>
      <VkSelectContent>
        <VkSelectGroup>
          <VkSelectItem value="CODE128">CODE128</VkSelectItem>
          <VkSelectItem value="EAN13">EAN13</VkSelectItem>
          <VkSelectItem value="UPC">UPC</VkSelectItem>
          <VkSelectItem value="CODE39">CODE39</VkSelectItem>
          <VkSelectItem value="ITF">ITF</VkSelectItem>
        </VkSelectGroup>
      </VkSelectContent>
    </VkSelect>
  </div>
  <div>
    <VkLabel>内容</VkLabel>
    <VkInput :model-value="element.content" @update:model-value="onContentChange"> </VkInput>
  </div>
  <div>
    <label class="block text-sm text-gray-600">可见性</label>
    <VkSwitch :model-value="element.displayValue" @update:model-value="onDisplayValueUpdate" />
  </div>
  <div>
    <label class="block text-sm text-gray-600">高度</label>
    <VkInputNumberMM :model-value="element.hmm" @update:model-value="onSizeChange" />
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
    <label class="block text-sm text-gray-600">留白</label>
    <VkInputNumberMM
      :min="0"
      :model-value="element.marginMM"
      @update:model-value="onMarginMMUpdate"
    >
    </VkInputNumberMM>
  </div>
  <div>
    <label class="block text-sm text-gray-600">字体大小</label>
    <VkInputNumberMM :model-value="element.fontSizeMM" @update:model-value="onFontSizeMMUpdate" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EditorHost } from '@/core'
import type { BarcodeElement } from './barcode'
import { usePropertyCommand } from '@/hooks'
import {
  VkInputNumberMM,
  VkInput,
  VkLabel,
  VkSelect,
  VkSelectContent,
  VkSelectItem,
  VkSelectGroup,
  VkSelectTrigger,
  VkSelectValue,
  VkSwitch,
  VkInputNumber,
} from '../../components'

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

function onSizeChange(value: any) {
  batchUpdateProperty(selection, 'hmm', value)
}
function onFontSizeMMUpdate(value: any) {
  batchUpdateProperty(selection, 'fontSizeMM', value)
}
function onDisplayValueUpdate(value: any) {
  batchUpdateProperty(selection, 'displayValue', value)
}
function onMarginMMUpdate(value: any) {
  batchUpdateProperty(selection, 'marginMM', value)
}
</script>

<style scoped></style>
