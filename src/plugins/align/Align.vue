<template>
  <div>
    <ElButtonGroup>
      <ElButton text @click="handleAlign('left')" title="左对齐">
        <Icon icon="material-symbols-light:align-horizontal-left" width="25px" />
      </ElButton>
      <ElButton text @click="handleAlign('right')" title="右对齐">
        <Icon icon="material-symbols-light:align-horizontal-right" width="25px" />
      </ElButton>
      <ElButton text @click="handleAlign('top')" title="上对齐">
        <Icon icon="material-symbols-light:align-vertical-top" width="25px" />
      </ElButton>
      <ElButton text @click="handleAlign('bottom')" title="下对齐">
        <Icon icon="material-symbols-light:align-vertical-bottom" width="25px" />
      </ElButton>
    </ElButtonGroup>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ElButton, ElButtonGroup } from 'element-plus'
import type { SelectionPlugin } from '../SelectionPlugin'
import { AlignElementsCommand } from '@/commands'
import { Icon } from '@iconify/vue'

const { host } = defineProps<{ host: IEditorHost }>()

function handleAlign(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {
  const selectionElements = host.getPlugin<SelectionPlugin>('selection')?.selectionElements
  if (!selectionElements) return
  host.executeCommand(
    new AlignElementsCommand(host, alignment, Array.from(selectionElements?.keys())),
  )
}
</script>

<style scoped></style>
