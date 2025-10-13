<template>
  <Vkedit :host="host"></Vkedit>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { createEditorHost, Vkedit } from '@/index'
import { RectPlugin, TextPlugin, TablePlugin } from '@/plugins'
import { EditorEvents } from '@/types/EventTypes'
import BaseElementPropertyPanel from '@/components/BaseElementPropertyPanel.vue'

// const host = ref<IEditorHost>(new EditorHost())
const host = createEditorHost()
host
  .installPlugin(new RectPlugin())
  .installPlugin(new TextPlugin())
  .installPlugin(new TablePlugin())

onMounted(() => {
  host.emit(EditorEvents.PROPERTY_PANEL_PUBLIC_REGISTERED, BaseElementPropertyPanel)
})
</script>

<style scoped></style>
