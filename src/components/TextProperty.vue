<template>
  <div class="vkedit-property__col-full" style="display: flex; gap: 4px; min-width: 0">
    <div style="flex: 1; min-width: 0">
      <VkInputMM
        :model-value="fontSize"
        :min="0"
        :dpm="hostState.dpm"
        @update:model-value="(value: any) => emit('update', 'fontSize', value)"
      ></VkInputMM>
    </div>
    <VkToggle
      size="sm"
      :model-value="fontStyle?.includes('bold') ?? false"
      @update:model-value="
        (value: boolean) =>
          emit(
            'update',
            'fontStyle',
            value ? `${fontStyle} bold` : fontStyle?.replace('bold', '').trim(),
          )
      "
    >
      <Icon icon="material-symbols-light:format-bold" style="width: 20px; height: 20px"></Icon>
    </VkToggle>
    <VkToggle
      size="sm"
      :model-value="fontStyle?.includes('italic') ?? false"
      @update:model-value="
        (value: boolean) =>
          emit(
            'update',
            'fontStyle',
            value ? `italic ${fontStyle}` : fontStyle?.replace('italic', '').trim(),
          )
      "
    >
      <Icon icon="material-symbols-light:format-italic" style="width: 20px; height: 20px"></Icon>
    </VkToggle>
  </div>
  <div class="vkedit-property__col-full" style="display: flex; gap: 1px; min-width: 0">
    <VkToggle
      size="sm"
      :model-value="align == 'left'"
      @update:model-value="emit('update', 'align', 'left')"
      ><Icon
        icon="material-symbols-light:align-justify-flex-start"
        style="width: 16px; height: 16px"
    /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="align == 'center'"
      @update:model-value="emit('update', 'align', 'center')"
      ><Icon icon="material-symbols-light:align-justify-center" style="width: 16px; height: 16px"
    /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="align == 'right'"
      @update:model-value="emit('update', 'align', 'right')"
      ><Icon icon="material-symbols-light:align-justify-flex-end" style="width: 16px; height: 16px"
    /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'top'"
      @update:model-value="emit('update', 'verticalAlign', 'top')"
      ><Icon icon="material-symbols-light:align-start" style="width: 16px; height: 16px"
    /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'middle'"
      @update:model-value="emit('update', 'verticalAlign', 'middle')"
      ><Icon icon="material-symbols-light:align-center" style="width: 16px; height: 16px"
    /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'bottom'"
      @update:model-value="emit('update', 'verticalAlign', 'bottom')"
      ><Icon icon="material-symbols-light:align-end" style="width: 16px; height: 16px"
    /></VkToggle>
  </div>
</template>

<script setup lang="ts">
import { VkToggle, VkLabel, VkInputMM } from '@/components/ui'
import { Icon } from '@iconify/vue'
import { useHostState } from '@/hooks'
import type { EditorHost } from '@/core'
import type { IAlign, IFontStyle, IVerticalAlign } from '@/types'
const { fontSize, align, verticalAlign, fontStyle, host } = defineProps<{
  host: EditorHost
  fontSize: number
  align: IAlign
  verticalAlign: IVerticalAlign
  fontStyle?: IFontStyle // 文字加粗
}>()

const emit = defineEmits<{
  update: [property: string, value: any]
}>()

// 获取 hostState 用于 dpm
const { hostState } = useHostState(host)
</script>

<style scoped></style>
