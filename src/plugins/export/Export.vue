<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" title="下载">
          <Icon
            icon="material-symbols-light:file-export-outline-sharp"
            style="width: 25px; height: 25px"
          ></Icon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>导出文件</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="exportPlugin.handleExportPdf()">
            <span>PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="exportPlugin.handleExportImage()">
            <span>PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="exportPlugin.handleExportJSON()">
            <span>JSON</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { type IEditorHost } from '@/types'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ExportPlugin } from './export'

const { host } = defineProps<{ host: IEditorHost }>()

const exportPlugin = host.getPlugin<ExportPlugin>('export-plugin')!
</script>

<style scoped></style>
