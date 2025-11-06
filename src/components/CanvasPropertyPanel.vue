<template>
  <div class="text-xl font-bold pb-2">画布属性</div>
  <div></div>
  <div class="">纸张设置</div>
  <div></div>
  <div>
    <Label>宽度</Label>
    <VkInputMM v-model="hostState.width" :dpm="hostState.dpm"></VkInputMM>
  </div>
  <div>
    <Label>高度</Label>
    <VkInputMM v-model="hostState.height" :dpm="hostState.dpm"></VkInputMM>
  </div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement, IEditorHost } from '@/types'
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { VkInputMM } from '@/components/ui'

interface Props {
  host: IEditorHost
  element: BaseGraphicElement | undefined
  selection: BaseGraphicElement[]
}

const { host } = defineProps<Props>()
const hostState = ref(host.getState())
</script>

<style scoped></style>
