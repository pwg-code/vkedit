<template>
  <v-group :config="element.groupConfig">
    <v-rect :config="element.hitRectConfig" />
    <v-rect :config="element.visibleRectConfig" />
  </v-group>
</template>

<script setup lang="ts">
import type { ShapeProps } from '@/types/shape-props'
import type { LineElement } from './line'

export interface Props extends ShapeProps<LineElement> {}
const { element } = defineProps<Props>()
</script>
