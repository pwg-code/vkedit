<template>
  <v-group :config="element.config">
    <v-image v-if="chartImage" :config="{ image: chartImage }" />
    <v-slot></v-slot>
  </v-group>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { ChartElement } from './chart'
import type { EditorHost } from '@/core'
import * as echarts from 'echarts'

interface Props {
  host: EditorHost
  element: ChartElement
}

const { host, element } = defineProps<Props>()

const chartImage = ref<HTMLCanvasElement | HTMLImageElement | null>(null)

const renderChart = async () => {
  const width = Math.max(1, Math.round(element.width))
  const height = Math.max(1, Math.round(element.height))
  // 创建 ECharts 实例
  const echartsDiv = document.createElement('div')
  echartsDiv.style.width = width + 'px'
  echartsDiv.style.height = height + 'px'
  document.body.appendChild(echartsDiv)
  const echartInstance = echarts.init(echartsDiv, null, {
    renderer: 'canvas',
    width,
    height,
  })
  echartInstance.setOption({ ...element.chartOptions, animation: false })
  chartImage.value = echartInstance.renderToCanvas()
  echartInstance.dispose()
  document.body.removeChild(echartsDiv)
}

onMounted(() => {
  renderChart()
})

watch(
  () => [element.chartOptions, element.width, element.height],
  () => {
    renderChart()
  },
  { deep: true },
)
</script>

<style scoped></style>
