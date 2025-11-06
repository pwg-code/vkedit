<template>
  <div class="text-xl font-bold py-2">文本属性</div>
  <TextProperty
    :text="element.text"
    :font-size="element.fontSize"
    :align="element.align"
    :font-style="element.fontStyle"
    :vertical-align="element.verticalAlign"
    @update="(prop, value) => batchUpdateProperty(selection, prop, value)"
  ></TextProperty>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { TextElement } from './text'
import TextProperty from '@/components/TextProperty.vue'
import { usePropertyCommand } from '@/hooks'

interface Props {
  host: IEditorHost
  element: TextElement
  selection: TextElement[]
}

const { element, host, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)
</script>

<style scoped></style>
