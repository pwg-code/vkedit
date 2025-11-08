<template>
  <Button v-bind="$attrs" variant="outline" @click="handleClick">矩形</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { EditorHost } from '@/core'

import { AddElementCommand } from '@/commands'
import { RectElement } from './rect'

// 接收host

const { host } = defineProps<{
  host: EditorHost
}>()

function handleClick() {
  host.executeCommand(new AddElementCommand(new RectElement(50, 50), host))
}
</script>

<style scoped></style>

