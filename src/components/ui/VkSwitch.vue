<template>
  <label :class="['vkedit-switch', $props.class]">
    <input
      type="checkbox"
      role="switch"
      class="vkedit-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="vkedit-switch__thumb"></span>
  </label>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

withDefaults(defineProps<{
  modelValue: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped></style>
