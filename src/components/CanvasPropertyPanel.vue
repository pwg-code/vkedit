<template>
  <div>
    <div class="text-xl font-bold pb-2">画布属性</div>
    <div class="grid grid-cols-2 gap-4 items-center py-3">
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
    </div>
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
