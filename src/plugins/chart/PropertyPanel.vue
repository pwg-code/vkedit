<template>
  <div class="vkedit-property__col-full">图表属性</div>
  <div class="vkedit-property__col-full">
    <div>
      <label class="vkedit-property__label">宽度(mm)</label>
      <input
        type="number"
        class="vkedit-chart__input"
        v-model.number="widthMm"
        @change="onSizeChange"
      />
    </div>

    <div>
      <label class="vkedit-property__label">高度(mm)</label>
      <input
        type="number"
        class="vkedit-chart__input"
        v-model.number="heightMm"
        @change="onSizeChange"
      />
    </div>

    <div>
      <label class="vkedit-property__label">图表选项(JSON)</label>
      <textarea
        class="vkedit-chart__textarea"
        rows="3"
        v-model="chartOptionsJson"
        @change="onOptionsChange"
      ></textarea>
      <p v-if="optionsError" class="vkedit-chart__error">{{ optionsError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EditorHost } from '@/core'
import type { ChartElement } from './chart'
import { usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: ChartElement
  selection: ChartElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

const widthMm = ref(element.wmm)
const heightMm = ref(element.hmm)
const chartOptionsJson = ref(JSON.stringify(element.chartOptions, null, 2))
const dataError = ref('')
const optionsError = ref('')

function onSizeChange() {
  batchUpdateProperty(selection, 'wmm', widthMm.value)
  batchUpdateProperty(selection, 'hmm', heightMm.value)
}

function onOptionsChange() {
  optionsError.value = ''
  try {
    const options = JSON.parse(chartOptionsJson.value)
    batchUpdateProperty(selection, 'chartOptions', options)
  } catch (e: any) {
    optionsError.value = '无效的 JSON 格式: ' + e.message
  }
}

watch(
  () => element.wmm,
  (newVal) => {
    widthMm.value = newVal
  },
)

watch(
  () => element.hmm,
  (newVal) => {
    heightMm.value = newVal
  },
)

watch(
  () => element.chartOptions,
  (newVal) => {
    chartOptionsJson.value = JSON.stringify(newVal, null, 2)
  },
  { deep: true },
)
</script>

<style scoped></style>
