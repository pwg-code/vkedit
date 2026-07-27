<template>
  <div class="vkedit-property__title">画布属性</div>
  <div></div>
  <div class="">纸张设置</div>
  <div></div>
  <div class="vkedit-property__col-full">
    <VkLabel>dpm(点/毫米)</VkLabel>
    <VkInputNumber
      :model-value="hostState.dpm"
      @update:model-value="(value) => updateCanvasProperty('dpm', value)"
      :min="1"
      :step="0.01"
      :max="24"
    />
  </div>
  <div>
    <VkLabel>宽度</VkLabel>
    <VkInputMM
      :model-value="hostState.width"
      @update:model-value="
        (value) => {
          updateCanvasProperty('width', value)
        }
      "
      :dpm="hostState.dpm"
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>高度</VkLabel>
    <VkInputMM
      :model-value="hostState.height"
      @update:model-value="
        (value) => {
          updateCanvasProperty('height', value)
        }
      "
      :dpm="hostState.dpm"
    ></VkInputMM>
  </div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement } from '@/types'
import type { EditorHost } from '@/core'
import { computed } from 'vue'
import { VkLabel, VkInputMM, VkInputNumber } from '@/components/ui'
import { useCanvasPropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: BaseGraphicElement | undefined
  selection: BaseGraphicElement[]
}

const { host } = defineProps<Props>()
const hostState = computed(() => host.status)
const { updateCanvasProperty } = useCanvasPropertyCommand(host)
</script>

<style scoped></style>
