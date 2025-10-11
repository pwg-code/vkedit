<template>
  <Vkedit :host="host"></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { EditorHost } from '../src'
import type { IEditorHost } from '@/types'
import { Vkedit } from '../src'
import {
  RectPlugin,
  TextPlugin,
  TablePlugin,
  SelectionPlugin,
  KeyDownPlugin,
  ElementsPlugin,
  GraphicTypesPlugin,
  PropertyPanelsPlugin,
} from '@/plugins'

// const host = ref<IEditorHost>(new EditorHost())
const host = new EditorHost()
host.registerPlugin(new GraphicTypesPlugin())
host.registerPlugin(new PropertyPanelsPlugin())
host.registerPlugin(new ElementsPlugin())
host.registerPlugin(new SelectionPlugin())
host.registerPlugin(new KeyDownPlugin())
host.registerPlugin(new RectPlugin())
host.registerPlugin(new TextPlugin())
host.registerPlugin(new TablePlugin())
onMounted(() => {})
</script>

<style scoped></style>
