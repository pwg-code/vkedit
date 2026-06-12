<template>
  <div>
    <div class="vkedit-btn-group">
      <VkButton variant="ghost" @click="handleAlign('left')" title="左对齐">
        <VkIcon name="align-horizontal-left" :size="25" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('right')" title="右对齐">
        <VkIcon name="align-horizontal-right" :size="25" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('top')" title="上对齐">
        <VkIcon name="align-vertical-top" :size="25" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('bottom')" title="下对齐">
        <VkIcon name="align-vertical-bottom" :size="25" />
      </VkButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { SelectionPlugin } from '../selection'
import { AlignElementsCommand } from '@/commands'
import { VkButton, VkIcon } from '@/components/ui'

const { host } = defineProps<{ host: EditorHost }>()

function handleAlign(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {
  const ids = host.getPlugin('selection-plugin').getSelectionElementIds()
  if (!ids) return
  host.executeCommand(new AlignElementsCommand(host, alignment, ids))
}
</script>
