<template>
  <div>
    <VkDropdown>
      <template #trigger>
        <VkButton variant="ghost" title="下载">
          <VkIcon name="file-export-outline" :size="25" />
        </VkButton>
      </template>
      <div class="vkedit-dropdown__label">导出文件</div>
      <div class="vkedit-dropdown__sep"></div>
      <button class="vkedit-dropdown__item" @click="exportPlugin.handleExportExcel()">
        <span>Excel</span>
      </button>
      <button class="vkedit-dropdown__item" @click="exportPlugin.handleExportPdf()">
        <span>PDF</span>
      </button>
      <button class="vkedit-dropdown__item" @click="exportPlugin.handleExportImage()">
        <span>PNG</span>
      </button>
      <button class="vkedit-dropdown__item" @click="exportPlugin.handleExportJSON()">
        <span>JSON</span>
      </button>
    </VkDropdown>
  </div>
</template>

<script setup lang="ts">
import { type EditorHost } from '@/core'
import { VkButton, VkDropdown, VkIcon } from '@/components/ui'
import type { ExportPlugin } from './export'

const { host } = defineProps<{ host: EditorHost }>()
const exportPlugin = host.getPlugin('export-plugin')!
</script>
