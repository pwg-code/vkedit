<template>
  <div class="col-span-full">二维码属性</div>
  <div class="col-span-full">
    <VkLabel>内容</VkLabel>
    <VkInput :model-value="element.content" @update:model-value="onContentChange"> </VkInput>
  </div>
  <div>
    <VkLabel>大小</VkLabel>
    <VkInputNumberMM :min="0" :model-value="element.wmm" @update:model-value="onSizeChange">
    </VkInputNumberMM>
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
    <VkLabel>留白</VkLabel>
    <VkInputNumberMM
      :min="0"
      :model-value="element.marginMM"
      @update:model-value="onMarginMMUpdate"
    >
    </VkInputNumberMM>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EditorHost } from '@/core'
import type { QrcodeElement } from './qrcode'
import { usePropertyCommand } from '@/hooks'
import { VkInputNumberMM, VkInput, VkLabel, VkInputNumber } from '../../components'

interface Props {
  host: EditorHost
  element: QrcodeElement
  selection: QrcodeElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

const foreground = ref(element.foreground)
const background = ref(element.background)

function onContentChange(value: any) {
  batchUpdateProperty(selection, 'content', value)
}

function onSizeChange(value: number) {
  batchUpdateProperty(selection, 'wmm', value)
}

function onMarginMMUpdate(value: number) {
  batchUpdateProperty(selection, 'marginMM', value)
}
</script>

<style scoped></style>
