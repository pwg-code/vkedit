<template>
  <div class="flex-2 border-[0.5px] border-gray-200 p-5">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '../types'

const { host } = defineProps<{ host: IEditorHost }>()
</script>

<style scoped></style>
