<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" title="导入">
          <Icon
            icon="material-symbols-light:display-external-input-sharp"
            style="width: 25px; height: 25px"
          ></Icon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>导入文件</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="importPlugin.importExcel()">
            <span>Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="importPlugin.handleImportJSON()">
            <span>JSON</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { type EditorHost } from '@/core'
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
import type { ImportPlugin } from './import'

const { host } = defineProps<{ host: EditorHost }>()

const importPlugin = host.getPlugin('import-plugin')
</script>

<style scoped></style>
