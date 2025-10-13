<template>
  <ElButton v-bind="$attrs">文本</ElButton>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import type { TextGraphicType } from './TextPlugin'

const { graphicType } = defineProps<{
  graphicType: TextGraphicType
}>()

// function handleClick() {
//   console.log(graphicType.createElement(50, 50))
//   graphicType.createElement(50, 50)
// }
</script>

<style scoped></style>
