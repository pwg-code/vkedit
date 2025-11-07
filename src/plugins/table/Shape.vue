<template>
  <v-group :config="element">
    <CellsBorder :element="element"></CellsBorder>
    <template v-for="(row, rowIndex) in cells" :key="`row-${rowIndex}`">
      <template v-for="(cell, colIndex) in row" :key="`cell-${rowIndex}-${colIndex}`">
        <!-- 如果单元格已经是合并状态则不渲染 -->
        <template v-if="cell.visible">
          <!-- 单元格内容 文本 -->
          <v-text
            :config="{
              x: cell.x + 2,
              y: cell.y + 2,
              width: cell.width - 4,
              height: cell.height - 4,
              text: cell.text,
              fontSize: cell.fontSize,
              align: cell.align,
              verticalAlign: cell.verticalAlign,
              fontStyle: cell.fontStyle,
            }"
            @click="handleCellClick($event, cell, rowIndex, colIndex)"
            @contextmenu="handleContextmenu($event, cell, rowIndex, colIndex)"
          />
        </template>
      </template>
    </template>
    <!-- 高亮活动单元格 -->
    <v-rect
      :config="{
        x: activeCell.x,
        y: activeCell.y,
        width: activeCell.width,
        height: activeCell.height,
        stroke: 'green',
        strokeWidth: 4,
      }"
    />
  </v-group>
  <!-- 上下文菜单 -->
  <div v-if="showMenu" class="flex flex-col gap-2 p-7 bg-white border border-gray-300 shadow-lg rounded-md absolute" :style="{ top: `${menuY}px`, left: `${menuX}px` }">
    <VkButton class="text-left" @click="element.removeRow(element.activeRow)">删除行</VkButton>
    <VkButton class="text-left" @click="element.removeCol(element.activeCol)">删除列</VkButton>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { CellConfig, TableElement } from './table'
import { computed, ref } from 'vue'
import type { SelectionPlugin } from '../selection'
import CellsBorder from './CellsBorder.vue'
import { VkButton } from "@/components/ui";

interface Props {
  element: TableElement
  host: IEditorHost
}

const { element, host } = defineProps<Props>()

const cells = computed(() => element.cells)
const activeCell = computed(() => element.activeCell)

// 是否显示上下文菜单
const showMenu = ref(false)

// 上下文菜单位置
const menuX = ref(0)
const menuY = ref(0)

// 当前活动单元格
const handleCellClick = (e: any, cell: CellConfig, row: number, col: number) => {
  element.activeCell = cell
  element.activeRow = row
  element.activeCol = col
  // 主动将选中状态同步到选择插件
  const selectionPlugin = host.getPlugin<SelectionPlugin>('selection-plugin')

  selectionPlugin.selectElement(element)
  // 停止事件冒泡
  e.cancelBubble = true
}

// 处理上下文菜单事件
const handleContextmenu = (e: any, cell: CellConfig, row: number, col: number) => {
  showMenu.value = true
  menuX.value = e.evt.clientX
  menuY.value = e.evt.clientY
  e.evt.preventDefault();
  element.activeCell = cell
  element.activeRow = row
  element.activeCol = col
  // 主动将选中状态同步到选择插件
  const selectionPlugin = host.getPlugin<SelectionPlugin>('selection-plugin')

  selectionPlugin.selectElement(element)
  // 停止事件冒泡
  e.cancelBubble = true
}

</script>
