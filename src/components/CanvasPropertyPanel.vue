<template>
  <div class="text-xl font-bold pb-2">画布属性</div>
  <div></div>
  <div class="">纸张设置</div>
  <div></div>
  <div>
    <Label>DPI</Label>
    <NumberField v-model="hostState.dpi" @update:model-value="updateCanvasPixel">
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div></div>
  <div>
    <Label>宽度mm</Label>
    <NumberField v-model="hostState.widthMM" @update:model-value="updateCanvasPixel">
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>高度mm</Label>
    <NumberField v-model="hostState.heightMM" @update:model-value="updateCanvasPixel">
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ref } from 'vue'
import { Label } from '@/components/ui/label'

import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

const { host } = defineProps<{ host: IEditorHost }>()
const hostState = ref(host.getState())

// 更新画布像素
const updateCanvasPixel = () => {
  // 像素 = （毫米 * DPI）/ 25.4
  const width = (hostState.value.widthMM * hostState.value.dpi) / 25.4
  const height = (hostState.value.heightMM * hostState.value.dpi) / 25.4
  host.setState({ width, height })
}
</script>

<style scoped></style>
