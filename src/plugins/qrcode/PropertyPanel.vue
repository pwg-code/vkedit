<template>
  <div class="vkedit-property__col-full">二维码属性</div>
  <div class="vkedit-property__col-full">
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
  <div class="vkedit-property__col-full">
    <VkColorPicker
      :model-value="element.foreground"
      label="前景色"
      @update:model-value="(value) => batchUpdateProperty(selection, 'foreground', value ?? '#000000')"
    />
  </div>
  <div class="vkedit-property__col-full">
    <VkColorPicker
      :model-value="element.background"
      label="背景色"
      @update:model-value="(value) => batchUpdateProperty(selection, 'background', value ?? '#ffffff')"
    />
  </div>
  <div v-if="readabilityWarning" class="vkedit-property__col-full vkedit-property__warning">
    {{ readabilityWarning }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EditorHost } from '@/core'
import type { QrcodeElement } from './qrcode'
import { usePropertyCommand } from '@/hooks'
import {
  VkInputNumberMM,
  VkInput,
  VkLabel,
  VkInputNumber,
  VkColorPicker,
} from '../../components'
import { useReadabilityWarning } from '@/utils/readability'

interface Props {
  host: EditorHost
  element: QrcodeElement
  selection: QrcodeElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

const foregroundRef = computed(() => element.foreground)
const backgroundRef = computed(() => element.background)
const readabilityWarning = useReadabilityWarning({
  foreground: foregroundRef,
  background: backgroundRef,
})

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

<style scoped>
.vkedit-property__warning {
  font-size: var(--vkedit-font-size-xs);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  padding: 4px 6px;
  border-radius: var(--vkedit-radius-sm);
  line-height: 1.4;
}
</style>