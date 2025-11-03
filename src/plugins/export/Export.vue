<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" title="下载">
          <Icon
            icon="material-symbols-light:download-sharp"
            style="width: 25px; height: 25px"
          ></Icon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>导出文件</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="">
            <span>PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Excel</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>PNG</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { SelectionPlugin } from '../selection-plugin'
import { AlignElementsCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { ButtonGroup } from '@/components/ui/button-group'

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

const { host } = defineProps<{ host: IEditorHost }>()

// 下载
function download(alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') {

}
</script>

<style scoped></style>
