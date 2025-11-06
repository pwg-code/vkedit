<template>
  <Button @click="host.getPlugin('preview-plugin').handlePreview()" variant="ghost" title="预览">
    <Icon icon="material-symbols-light:preview-outline" style="width: 25px; height: 25px"></Icon>
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { onMounted } from 'vue'

// 接收host
const { host } = defineProps<{
  host: import('@/types').IEditorHost
}>()
</script>

<style scoped></style>
