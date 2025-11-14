<template>
  <Button v-bind="$attrs" variant="outline" @click="handleClick">工作表</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { AddElementCommand } from '@/commands'
import { WorksheetElement } from './worksheet'
import type { EditorHost } from '@/core'

const { host } = defineProps<{
  host: EditorHost
}>()

function handleClick() {
  host.executeCommand(new AddElementCommand(new WorksheetElement(), host))
}
</script>

<style scoped></style>
