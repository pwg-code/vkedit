<template>
  <NumberField
    :model-value="valueMM"
    @update:model-value="
      (value: number) => {
        emit('update:model-value', value * dpmm)
        isEdit = false
      }
    "
    :step="step"
  >
    <NumberFieldContent>
      <NumberFieldDecrement />
      <div ref="inputParentRef">
        <Input
          v-if="!isEdit"
          class="text-center"
          :model-value="`${valueMM} mm`"
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
import { computed, nextTick, ref, watch } from 'vue'
import { round } from 'lodash'

const {
  modelValue,
  dpmm = 8,
  step = 0.1,
} = defineProps<{ modelValue: number; dpmm?: number; step?: number }>()

const emit = defineEmits<{
  'update:model-value': [number]
}>()

const isEdit = ref(false)

const valueMM = computed(() => {
  return round(modelValue / dpmm, 2)
})

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
