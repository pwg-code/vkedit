<template>
  <VkButton @click="host.getPlugin('preview-plugin').handlePreview()" variant="ghost" title="预览">
    <IconPreviewOutline :width="28" :height="28" />
  </VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import IconPreviewOutline from '~icons/material-symbols-light/preview-outline'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()
</script>
