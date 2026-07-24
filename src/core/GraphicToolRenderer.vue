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

let col = 0
let shiftX = 0
let shiftY = 0

function handleClick() {
  if (!props.host || !props.createElement) return
  const element = props.createElement()
  const dpm = props.host.status.dpm
  const canvasWmm = props.host.status.wmm
  const canvasHmm = props.host.status.hmm
  const elementWmm = element.width / dpm
  const elementHmm = element.height / dpm
  if (5 + shiftX + col * 5 + elementWmm > canvasWmm) {
    shiftY += 5
    col = 0
  }
  if (5 + shiftY + col * 5 + elementHmm > canvasHmm) {
    shiftX += 5
    col = 0
  }
  if (5 + shiftX + elementWmm > canvasWmm) {
    shiftX = 0
  }
  if (5 + shiftY + elementHmm > canvasHmm) {
    shiftY = 0
  }
  element.x = (5 + shiftX + col * 5) * dpm
  element.y = (5 + shiftY + col * 5) * dpm
  col++
  props.host.executeCommand(new AddElementCommand(props.host, element))
}
</script>

<style scoped></style>
