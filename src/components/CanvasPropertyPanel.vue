<template>
  <div class="text-xl font-bold pb-2">画布属性</div>
  <div></div>
  <div class="">纸张设置</div>
  <div></div>
  <div class="col-span-full">
    <Label>dpm(点/毫米)</Label>
    <VkNumberField
      :model-value="hostState.dpm"
      @update:model-value="(value) => host.setStatus({ dpm: value })"
    >
      <VkNumberFieldContent>
        <VkNumberFieldDecrement slot="decrement" />
        <VkNumberFieldInput slot="input" />
        <VkNumberFieldIncrement slot="increment" />
      </VkNumberFieldContent>
    </VkNumberField>
  </div>
  <div>
    <Label>宽度</Label>
    <VkInputMM
      :model-value="hostState.width"
      @update:model-value="
        (value) => {
          host.setStatus({ width: value })
        }
      "
      :dpm="hostState.dpm"
    ></VkInputMM>
  </div>
  <div>
    <Label>高度</Label>
    <VkInputMM
      :model-value="hostState.height"
      @update:model-value="
        (value) => {
          host.setStatus({ height: value })
        }
      "
      :dpm="hostState.dpm"
    ></VkInputMM>
  </div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement } from '@/types'
import type { EditorHost } from '@/core'
import { ref, watch, computed } from 'vue'
import { Label } from '@/components/ui/label'
import {
  VkInputMM,
  VkNumberFieldInput,
  VkNumberField,
  VkNumberFieldDecrement,
  VkNumberFieldIncrement,
  VkNumberFieldContent,
} from '@/components/ui'

interface Props {
  host: EditorHost
  element: BaseGraphicElement | undefined
  selection: BaseGraphicElement[]
}

const { host } = defineProps<Props>()
const hostState = computed(() => host.status)

</script>

<style scoped></style>
