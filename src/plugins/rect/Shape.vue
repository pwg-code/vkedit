<template>
  <v-rect v-bind="$attrs" :config="element" @click="handleClick" />
</template>

<script setup lang="ts">
import type { RectElement } from './rect-plugin'

interface Props {
  element: RectElement
}

const props = defineProps<Props>()

const handleClick = (event: any) => {
  // event.cancelBubble = true
}
</script>
