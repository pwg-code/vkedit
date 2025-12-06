<template>
  <div class="col-span-full">二维码属性</div>
  <div class="space-y-3">
    <div>
      <label class="block text-sm text-gray-600">内容</label>
      <input class="w-full border rounded px-2 py-1" v-model="content" @change="onContentChange" />
    </div>
    <div>
      <label class="block text-sm text-gray-600">宽度(px)</label>
      <input type="number" class="w-full border rounded px-2 py-1" v-model.number="widthPx" @change="onSizeChange" />
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
import type { QrElement } from './qr'
import { usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: QrElement
  selection: QrElement[]
}

const { host, element, selection } = defineProps<Props>()
const { batchUpdateProperty } = usePropertyCommand(host)

const content = ref(element.content)
const widthPx = ref(Math.round(element.width))
const foreground = ref(element.foreground)
const background = ref(element.background)

function onContentChange() {
  batchUpdateProperty(selection, 'content', content.value)
}

function onSizeChange() {
  const wmm = widthPx.value / host.status.dpm
  batchUpdateProperty(selection, 'wmm', wmm)
  batchUpdateProperty(selection, 'hmm', wmm)
}

function onColorChange() {
  batchUpdateProperty(selection, 'foreground', foreground.value)
  batchUpdateProperty(selection, 'background', background.value)
}
</script>

<style scoped></style>
