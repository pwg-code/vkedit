<template>
  <VkButton variant="ghost" @click="handleEdit">编辑</VkButton>

</template>

<script setup lang="ts">
import { VkButton } from "@/components/ui";

const { host } = defineProps<{
  host: import('@/core').EditorHost
}>();


function handleEdit() {
  console.log('编辑文本元素')
}

</script>

<style></style>
