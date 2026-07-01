<template>
  <button
    :class="['vkedit-btn', `vkedit-btn--${variant}`, `vkedit-btn--${size}`, $props.class]"
    :disabled="disabled"
    :title="title"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  title?: string
  class?: HTMLAttributes['class']
}>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
})
</script>

<style scoped></style>
