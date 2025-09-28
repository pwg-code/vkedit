<template>
  <GraphicComponentBase
    :element="element"
    :selected="selected"
    @select="$emit('select', $event)"
    @transform="$emit('transform', $event)"
  >
    <v-rect :config="rectConfig" @click="handleClick" />
  </GraphicComponentBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RectElement } from './RectPlugin'
import GraphicComponentBase from '../GraphicComponentBase.vue'
interface Props {
  element: RectElement
  selected: boolean
}

const props = defineProps<Props>()
// const emit = defineEmits<Emits>()

const rectConfig = computed(() => ({
  width: (props.element as any).width || 100,
  height: (props.element as any).height || 60,
  fill: (props.element as any).fill || '#3498db',
  stroke: (props.element as any).stroke || '#2980b9',
  strokeWidth: (props.element as any).strokeWidth || 2,
  cornerRadius: (props.element as any).cornerRadius || 0,
}))

const handleClick = (event: any) => {
  event.cancelBubble = true
}
</script>
