<template>
  <button
    :class="[
      'vkedit-toggle',
      `vkedit-toggle--${size}`,
      { 'vkedit-toggle--on': modelValue },
      $props.class,
    ]"
    :aria-pressed="modelValue"
    @click="emit('update:modelValue', !modelValue)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

type ToggleSize = 'default' | 'sm' | 'lg'

withDefaults(defineProps<{
  modelValue: boolean
  size?: ToggleSize
  class?: HTMLAttributes['class']
}>(), {
  size: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped></style>
