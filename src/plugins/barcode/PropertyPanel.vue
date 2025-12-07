<template>
  <div class="col-span-full">条码属性</div>
  <div class="space-y-3">
    <div>
      <label class="block text-sm text-gray-600">内容</label>
      <input class="w-full border rounded px-2 py-1" v-model="content" @change="onContentChange" />
    </div>
    <div>
      <label class="block text-sm text-gray-600">格式</label>
      <select class="w-full border rounded px-2 py-1" v-model="format" @change="onFormatChange">
        <option value="CODE128">CODE128</option>
        <option value="EAN13">EAN13</option>
        <option value="UPC">UPC</option>
        <option value="CODE39">CODE39</option>
        <option value="ITF">ITF</option>
      </select>
    </div>
    <div>
      <label class="block text-sm text-gray-600">高度(px)</label>
      <input type="number" class="w-full border rounded px-2 py-1" v-model.number="heightPx" @change="onSizeChange" />
    </div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-sm text-gray-600">前景色</label>
        <input type="color" class="w-full h-8 p-0 border rounded" v-model="foreground" @change="onColorChange" />
      </div>
      <div>
        <label class="block text-sm text-gray-600">背景色</label>
        <input type="color" class="w-full h-8 p-0 border rounded" v-model="background" @change="onColorChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EditorHost } from '@/core'
import type { BarcodeElement } from './barcode'
import { usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: BarcodeElement
  selection: BarcodeElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

const content = ref(element.content)
const format = ref(element.format)
const heightPx = ref(Math.round(element.height))
const foreground = ref(element.foreground)
const background = ref(element.background)

function onContentChange() {
  batchUpdateProperty(selection, 'content', content.value)
}

function onFormatChange() {
  batchUpdateProperty(selection, 'format', format.value)
}

function onSizeChange() {
  const hmm = heightPx.value / host.status.dpm
  batchUpdateProperty(selection, 'hmm', hmm)
}

function onColorChange() {
  batchUpdateProperty(selection, 'foreground', foreground.value)
  batchUpdateProperty(selection, 'background', background.value)
}
</script>

<style scoped></style>
