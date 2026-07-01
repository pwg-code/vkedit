<template>
  <input
    v-model="modelValue"
    :class="['vkedit-input', props.class]"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  defaultValue?: string | number
  class?: HTMLAttributes['class']
}>(), {
  defaultValue: '',
})

const emits = defineEmits<{
  'update:modelValue': [payload: string | number]
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<style scoped></style>
