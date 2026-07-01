<template>
  <label :class="['vkedit-label', $props.class]">
    <slot />
  </label>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<style scoped></style>
