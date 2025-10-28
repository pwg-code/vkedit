<template>
  <v-text v-bind="$attrs" :config="element" @click="handleClick" />
</template>

<script setup lang="ts">
import type { TextElement } from './text-plugin'

interface Props {
  element: TextElement
}

const props = defineProps<Props>()

const handleClick = (event: any) => {
  // event.cancelBubble = true
}
</script>
