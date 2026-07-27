<template>
  <v-group v-bind="$attrs" :config="element.groupConfig">
    <v-rect :config="element.hitRectConfig" />
    <v-rect :config="element.visibleRectConfig" />
  </v-group>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { LineElement } from './line'

export interface Props {
  host: EditorHost
  element: LineElement
}
const { element } = defineProps<Props>()
</script>
