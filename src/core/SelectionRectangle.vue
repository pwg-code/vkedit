<template>
  <v-rect v-if="visible" :config="rectConfig" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Point2D } from '../types'

interface Props {
  start: Point2D
  end: Point2D
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
})

// 计算矩形配置
const rectConfig = computed(() => {
  const x = Math.min(props.start.x, props.end.x)
  const y = Math.min(props.start.y, props.end.y)
  const width = Math.abs(props.end.x - props.start.x)
  const height = Math.abs(props.end.y - props.start.y)
  return {
    x,
    y,
    width,
    height,
    fill: 'rgba(52, 152, 219, 0.2)',
    stroke: '#3498db',
    strokeWidth: 1,
    dash: [4, 4],
    listening: false, // 不响应事件
  }
})
</script>

<style scoped>
/* 组件样式 */
</style>
