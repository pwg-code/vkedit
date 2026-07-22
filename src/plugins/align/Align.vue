<template>
  <div>
    <div class="vkedit-btn-group">
      <VkButton variant="ghost" @click="handleAlign('left')" title="左对齐">
        <IconAlignHorizontalLeft :width="28" :height="28" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('right')" title="右对齐">
        <IconAlignHorizontalRight :width="28" :height="28" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('top')" title="上对齐">
        <IconAlignVerticalTop :width="28" :height="28" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('bottom')" title="下对齐">
        <IconAlignVerticalBottom :width="28" :height="28" />
      </VkButton>
      <VkButton
        variant="ghost"
        @click="handleDistribute('horizontal')"
        :disabled="!canDistribute"
        :title="canDistribute ? '水平等距分布' : '至少选择 3 个元素'"
      >
        <IconHorizontalDistribute :width="28" :height="28" />
      </VkButton>
      <VkButton
        variant="ghost"
        @click="handleDistribute('vertical')"
        :disabled="!canDistribute"
        :title="canDistribute ? '垂直等距分布' : '至少选择 3 个元素'"
      >
        <IconVerticalDistribute :width="28" :height="28" />
      </VkButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import type { IGraphicElement, SelectionEventData } from '@/types'
import { AlignElementsCommand, DistributeElementsCommand } from '@/commands'
import { VkButton } from '@/components/ui'
import IconAlignHorizontalLeft from '~icons/material-symbols-light/align-horizontal-left'
import IconAlignHorizontalRight from '~icons/material-symbols-light/align-horizontal-right'
import IconAlignVerticalTop from '~icons/material-symbols-light/align-vertical-top'
import IconAlignVerticalBottom from '~icons/material-symbols-light/align-vertical-bottom'
import IconHorizontalDistribute from '~icons/material-symbols-light/horizontal-distribute'
import IconVerticalDistribute from '~icons/material-symbols-light/vertical-distribute'

const { host } = defineProps<{ host: EditorHost }>()

const selectionElements = ref<IGraphicElement[]>([])

const canDistribute = computed(() => {
  const valid = selectionElements.value.filter((el) => el.visible && !el.locked)
  return valid.length >= 3
})

function handleAlign(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {
  const ids = host.getPlugin('selection-plugin').getSelectionElementIds()
  if (!ids) return
  host.executeCommand(new AlignElementsCommand(host, alignment, ids))
}

function handleDistribute(direction: 'horizontal' | 'vertical') {
  const ids = host.getPlugin('selection-plugin').getSelectionElementIds()
  if (!ids || ids.length < 3) return
  host.executeCommand(new DistributeElementsCommand(host, direction, ids))
}

function handleSelectionChanged(data: SelectionEventData) {
  selectionElements.value = data.selection
}

onMounted(() => {
  const selectionPlugin = host.getPlugin('selection-plugin')
  selectionElements.value = selectionPlugin.getSelectionElements()
  host.on('selection:changed', handleSelectionChanged)
})

onUnmounted(() => {
  host.off('selection:changed', handleSelectionChanged)
})
</script>
