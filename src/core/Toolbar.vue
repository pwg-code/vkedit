<template>
  <div class="vkedit-floating-toolbar">
    <div class="vkedit-toolbar__group">
      <VkButton text title="撤销" @click="handleUndo" :disabled="!canUndo" variant="ghost">
        <IconUndo :width="28" :height="28" />
      </VkButton>
      <VkButton text title="重做" @click="handleRedo" :disabled="!canRedo" variant="ghost">
        <IconRedo :width="28" :height="28" />
      </VkButton>
    </div>

    <template v-if="toolsByGroup.tools.length > 0">
      <div class="vkedit-toolbar__divider" />
      <div class="vkedit-toolbar__group">
        <template v-for="item in toolsByGroup.tools" :key="item.toolName">
          <component :is="item.render()" :host="host" />
        </template>
      </div>
    </template>

    <template v-if="hasActionsSlot || toolsByGroup.actions.length > 0">
      <div class="vkedit-toolbar__divider" />
      <div class="vkedit-toolbar__group">
        <template v-for="item in toolsByGroup.actions" :key="item.toolName">
          <component :is="item.render()" :host="host" />
        </template>
        <slot name="actions" :host="host" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import type { IEditorState, ToolEventData, HistoryEventData } from '../types'
import type { EditorHost } from '@/core'
import { VkButton } from '@/components/ui'
import IconUndo from '~icons/ph/arrow-counter-clockwise-light'
import IconRedo from '~icons/ph/arrow-clockwise-light'
import { ToolbarManagerPlugin } from '@/plugins'

interface Props {
  host: EditorHost
}

const { host } = defineProps<Props>()
const slots = defineSlots<{
  actions?(props: { host: EditorHost }): any
}>()

const hostState = ref<IEditorState>(host.status)

const toolbarPlugin = host.getPlugin('toolbar-manager-plugin') as ToolbarManagerPlugin | undefined

const tools = ref<ToolEventData[]>([])

const initTools = () => {
  if (toolbarPlugin?.getTools) {
    tools.value = toolbarPlugin.getTools()
  }
}

const toolsByGroup = computed(() => {
  if (toolbarPlugin?.getGroupedTools) {
    return toolbarPlugin.getGroupedTools()
  }
  const grouped: Record<string, ToolEventData[]> = {}
  for (const tool of tools.value) {
    const g = tool.group ?? 'tools'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(tool)
  }
  return grouped
})

const hasActionsSlot = computed(() => !!slots.actions)

const canUndo = ref(false)
const canRedo = ref(false)

const handleUndo = () => {
  host.undo()
}

const handleRedo = () => {
  host.redo()
}

const onHistoryChanged = (payload: HistoryEventData) => {
  canUndo.value = payload.canUndo
  canRedo.value = payload.canRedo
}

onMounted(() => {
  initTools()
  host.on('history:changed', onHistoryChanged)
})

onBeforeUnmount(() => {
  host.off('history:changed', onHistoryChanged)
})
</script>

<style scoped></style>
