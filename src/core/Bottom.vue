<template>
  <div class="h-12 flex items-center justify-center border-[0.5px] border-gray-200">
    <div>我是底部区域</div>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from './types'

const { host } = defineProps<{ host: IEditorHost }>()
</script>

<style scoped></style>
