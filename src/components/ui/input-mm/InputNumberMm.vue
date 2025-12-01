<template>
  <NumberField v-model="model" :step="step">
    <NumberFieldContent>
      <NumberFieldDecrement />
      <div ref="inputParentRef">
        <Input
          v-if="!isEdit"
          class="text-center"
          :model-value="`${model} mm`"
          @mousedown.prevent="() => (isEdit = true)"
        ></Input>
        <!-- @click="isEdit = true" -->
        <NumberFieldInput v-show="isEdit" />
      </div>
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>
</template>

<script setup lang="ts">
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
} from '../number-field'
import { Input } from '../input'
import { nextTick, ref, watch } from 'vue'

const { step = 0.1 } = defineProps<{ step?: number }>()

const model = defineModel<number>({
  type: Number,
  required: true,
})

const isEdit = ref(false)

const inputParentRef = ref<HTMLInputElement | null>(null)

watch(isEdit, async (val) => {
  if (val) {
    await nextTick()
    const input = inputParentRef.value?.querySelector('input')
    input?.focus() // 或其他操作
  }
})
</script>

<style scoped></style>
