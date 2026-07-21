<template>
  <VkButton
    v-bind="$attrs"
    variant="ghost"
    class="vkedit-tool-link"
    :size="collapsed ? 'icon' : 'default'"
    :title="typeDisplayName"
    @click="handleClick"
  >
    <component :is="iconComponent" width="20" />
    <span v-if="!collapsed">{{ typeDisplayName }}</span>
  </VkButton>
</template>

<script setup lang="ts">
import { VkButton } from '@/components/ui'
import { AddElementCommand } from '@/commands'
import type { EditorHost } from '@/core'
import type { IGraphicElement } from '@/types'

const props = defineProps<{
  type: string
  iconComponent: any
  typeDisplayName: string
  createElement: () => IGraphicElement
  host: EditorHost
  collapsed?: boolean
}>()

function handleClick() {
  if (!props.host || !props.createElement) return
  const element = props.createElement()
  props.host.executeCommand(new AddElementCommand(props.host, element))
}
</script>

<style scoped></style>
