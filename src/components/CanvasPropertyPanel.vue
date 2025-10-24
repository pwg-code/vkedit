<template>
  <div class="text-xl font-bold pb-2">画布属性</div>
  <div></div>
  <div>
    <Label>宽度</Label>
    <NumberField v-model="hostState.width">
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <Label>高度</Label>
    <NumberField v-model="hostState.height">
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
</script>

<style scoped></style>
