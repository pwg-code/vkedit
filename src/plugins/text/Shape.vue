<template>
  <v-text :config="element.config" @click="handleClick" />
</template>

<script setup lang="ts">
import type { ShapeProps } from '@/types/shape-props'
import type { TextElement } from './text'

export interface Props extends ShapeProps<TextElement> {}

const props = defineProps<Props>()

const handleClick = (event: any) => {
  // event.cancelBubble = true
}
</script>
