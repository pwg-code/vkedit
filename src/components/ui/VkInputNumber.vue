<template>
  <input
    type="number"
    :class="['vkedit-input', $props.class]"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    @input="emit('update:modelValue', parseFloat(($event.target as HTMLInputElement).value))"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  class?: HTMLAttributes['class']
}>(), {
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<style scoped></style>
