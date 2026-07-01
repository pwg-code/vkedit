<template>
  <VkButton @click="host.getPlugin('preview-plugin').handlePreview()" variant="ghost" title="预览">
    <VkIcon name="preview-outline" :size="25" />
  </VkButton>
</template>

<script setup lang="ts">
import { VkButton, VkIcon } from '@/components/ui'

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()
</script>
