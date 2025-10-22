<template>
  <div>
    <ButtonGroup>
      <Button variant="ghost" @click="handleAlign('left')" title="左对齐">
        <Icon icon="material-symbols-light:align-horizontal-left" width="25px" />
      </Button>
      <Button variant="ghost" @click="handleAlign('right')" title="右对齐">
        <Icon icon="material-symbols-light:align-horizontal-right" width="25px" />
      </Button>
      <Button variant="ghost" @click="handleAlign('top')" title="上对齐">
        <Icon icon="material-symbols-light:align-vertical-top" width="25px" />
      </Button>
      <Button variant="ghost" @click="handleAlign('bottom')" title="下对齐">
        <Icon icon="material-symbols-light:align-vertical-bottom" width="25px" />
      </Button>
    </ButtonGroup>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { SelectionPlugin } from '../SelectionPlugin'
import { AlignElementsCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { ButtonGroup } from '@/components/ui/button-group'

import { Button } from '@/components/ui/button'

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
