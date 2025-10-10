<template>
  <Vkedit :host="host"></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { EditorHost } from '../src'
import type { IEditorHost } from '@/types'
import { Vkedit } from '../src'
import { RectPlugin, TextPlugin, SelectionPlugin } from '@/plugins'

// const host = ref<IEditorHost>(new EditorHost())
const host = new EditorHost()

onMounted(() => {
  host.registerPlugin(new RectPlugin())
  host.registerPlugin(new TextPlugin())
  host.registerPlugin(new SelectionPlugin())
})
</script>

<style scoped></style>
