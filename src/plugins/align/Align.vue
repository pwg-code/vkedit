<template>
  <div>
    <div class="vkedit-btn-group">
      <VkButton variant="ghost" @click="handleAlign('left')" title="左对齐">
        <Icon icon="material-symbols-light:align-horizontal-left" width="25px" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('right')" title="右对齐">
        <Icon icon="material-symbols-light:align-horizontal-right" width="25px" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('top')" title="上对齐">
        <Icon icon="material-symbols-light:align-vertical-top" width="25px" />
      </VkButton>
      <VkButton variant="ghost" @click="handleAlign('bottom')" title="下对齐">
        <Icon icon="material-symbols-light:align-vertical-bottom" width="25px" />
      </VkButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { SelectionPlugin } from '../selection'
import { AlignElementsCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { VkButton } from '@/components/ui'

const { host } = defineProps<{ host: EditorHost }>()

function handleAlign(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {
  const ids = host.getPlugin('selection-plugin').getSelectionElementIds()
  if (!ids) return
  host.executeCommand(new AlignElementsCommand(host, alignment, ids))
}
</script>

<style scoped></style>
