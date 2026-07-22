<template>
  <div>
    <VkDropdown>
      <template #trigger>
        <VkButton variant="ghost" title="导入">
          <IconDisplayExternalInput :width="28" :height="28" />
        </VkButton>
      </template>
      <div class="vkedit-dropdown__label">导入文件</div>
      <div class="vkedit-dropdown__sep"></div>
      <button class="vkedit-dropdown__item" @click="importPlugin.importExcel()">
        <span>Excel</span>
      </button>
      <button class="vkedit-dropdown__item" @click="importPlugin.handleImportJSON()">
        <span>JSON</span>
      </button>
    </VkDropdown>
  </div>
</template>

<script setup lang="ts">
import { type EditorHost } from '@/core'
import { VkButton, VkDropdown } from '@/components/ui'
import IconDisplayExternalInput from '~icons/material-symbols-light/display-external-input'
import type { ImportPlugin } from './import'

const { host } = defineProps<{ host: EditorHost }>()
const importPlugin = host.getPlugin('import-plugin')
</script>
