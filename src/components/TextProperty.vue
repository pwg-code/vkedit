<template>
  <div v-if="text !== undefined" class="vkedit-property__col-full" style="display: flex; flex-direction: column; gap: 4px">
    <VkLabel>文本内容</VkLabel>
    <VkTextarea
      :rows="3"
      :model-value="text"
      :placeholder="'请输入文本，支持回车换行'"
      @update:model-value="(value: string) => emit('update', 'text', value)"
    ></VkTextarea>
  </div>
  <div v-if="fill !== undefined" class="vkedit-property__col-full">
    <VkColorPicker
      :model-value="fill"
      label="文字颜色"
      @update:model-value="(value: string | null) => emit('update', 'fill', value ?? '#000000')"
    />
  </div>
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
      <IconFormatBold style="width: 20px; height: 20px" />
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
      <IconFormatItalic style="width: 20px; height: 20px" />
    </VkToggle>
  </div>
  <div class="vkedit-property__col-full" style="display: flex; gap: 1px; min-width: 0">
    <VkToggle
      size="sm"
      :model-value="align == 'left'"
      @update:model-value="emit('update', 'align', 'left')"
      ><IconAlignJustifyFlexStart style="width: 16px; height: 16px" /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="align == 'center'"
      @update:model-value="emit('update', 'align', 'center')"
      ><IconAlignJustifyCenter style="width: 16px; height: 16px" /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="align == 'right'"
      @update:model-value="emit('update', 'align', 'right')"
      ><IconAlignJustifyFlexEnd style="width: 16px; height: 16px" /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'top'"
      @update:model-value="emit('update', 'verticalAlign', 'top')"
      ><IconAlignStart style="width: 16px; height: 16px" /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'middle'"
      @update:model-value="emit('update', 'verticalAlign', 'middle')"
      ><IconAlignCenter style="width: 16px; height: 16px" /></VkToggle>
    <VkToggle
      size="sm"
      :model-value="verticalAlign == 'bottom'"
      @update:model-value="emit('update', 'verticalAlign', 'bottom')"
      ><IconAlignEnd style="width: 16px; height: 16px" /></VkToggle>
  </div>
</template>

<script setup lang="ts">
import { VkToggle, VkLabel, VkInputMM, VkColorPicker, VkTextarea } from '@/components/ui'
import IconFormatBold from '~icons/material-symbols-light/format-bold'
import IconFormatItalic from '~icons/material-symbols-light/format-italic'
import IconAlignJustifyFlexStart from '~icons/material-symbols-light/align-justify-flex-start'
import IconAlignJustifyCenter from '~icons/material-symbols-light/align-justify-center'
import IconAlignJustifyFlexEnd from '~icons/material-symbols-light/align-justify-flex-end'
import IconAlignStart from '~icons/material-symbols-light/align-start'
import IconAlignCenter from '~icons/material-symbols-light/align-center'
import IconAlignEnd from '~icons/material-symbols-light/align-end'
import { useHostState } from '@/hooks'
import type { EditorHost } from '@/core'
import type { IAlign, IFontStyle, IVerticalAlign } from '@/types'
const {
  text,
  fill,
  fontSize,
  align,
  verticalAlign,
  fontStyle,
  host,
} = defineProps<{
  host: EditorHost
  text?: string
  fill?: string
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