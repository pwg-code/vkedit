<template>
  <div class="col-span-full">
    <VkLabel>内容</VkLabel>
    <VkTextarea
      :model-value="text"
      @update:model-value="(value: any) => emit('update', 'text', value)"
    ></VkTextarea>
  </div>
  <div class="col-span-full flex">
    <div class="min-w-[100px]">
      <VkInputMM
        :model-value="fontSize"
        :min="0"
        :dpm="hostState.dpm"
        @update:model-value="(value: any) => emit('update', 'fontSize', value)"
      ></VkInputMM>
      <!-- <NumberField
        :model-value="fontSize"
        :min="0"
        @update:model-value="(value: any) => emit('update','fontSize',value)"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField> -->
    </div>
    <VkToggle
      :model-value="fontStyle == 'bold'"
      @update:model-value="
        (value: boolean) => emit('update', 'fontStyle', value ? 'bold' : 'normal')
      "
    >
      <Icon icon="material-symbols-light:format-bold" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle :model-value="align == 'left'" @update:model-value="emit('update', 'align', 'left')"
      ><Icon
        icon="material-symbols-light:align-justify-flex-start"
        style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="align == 'center'"
      @update:model-value="emit('update', 'align', 'center')"
      ><Icon icon="material-symbols-light:align-justify-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle :model-value="align == 'right'" @update:model-value="emit('update', 'align', 'right')"
      ><Icon icon="material-symbols-light:align-justify-flex-end" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="verticalAlign == 'top'"
      @update:model-value="emit('update', 'verticalAlign', 'top')"
      ><Icon icon="material-symbols-light:align-start" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="verticalAlign == 'middle'"
      @update:model-value="emit('update', 'verticalAlign', 'middle')"
      ><Icon icon="material-symbols-light:align-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="verticalAlign == 'bottom'"
      @update:model-value="emit('update', 'verticalAlign', 'bottom')"
      ><Icon icon="material-symbols-light:align-end" style="width: 25px; height: 25px"
    /></VkToggle>
  </div>
</template>

<script setup lang="ts">
import { VkTextarea, VkToggle, VkLabel, VkInputMM } from '@/components/ui'
import { Icon } from '@iconify/vue'
import { useHostState } from '@/hooks'
import type { IEditorHost } from '@/types'
const { text, fontSize, align, verticalAlign, fontStyle } = defineProps<{
  text: string
  fontSize: number
  align: 'left' | 'center' | 'right' | 'justify'
  verticalAlign: 'top' | 'middle' | 'bottom'
  fontStyle?: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' // 文字加粗
}>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

// 接收host
const { host } = defineProps<{
  host: IEditorHost
}>()

// 获取 hostState 用于 dpm
const { hostState } = useHostState(host)
</script>

<style scoped></style>
