<template>
  <VkButton @click="host.getPlugin('preview-plugin').handlePreview()" variant="ghost" title="预览">
    <Icon icon="material-symbols-light:preview-outline" style="width: 25px; height: 25px"></Icon>
  </VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { Icon } from '@iconify/vue'
import { onMounted } from 'vue'

// 接收host
const { host } = defineProps<{
  host: import('@/core').EditorHost
}>()
</script>

<style scoped></style>
