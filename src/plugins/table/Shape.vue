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
            @click="handleCellClick(cell, rowIndex, colIndex)"
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
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { CellConfig, TableElement } from './table-plugin'
import { computed, ref } from 'vue'
import type { SelectionPlugin } from '../selection-plugin'
import CellsBorder from './CellsBorder.vue'

interface Props {
  element: TableElement
  host: IEditorHost
}

const { element, host } = defineProps<Props>()

const cells = computed(() => element.cells)
const activeCell = computed(() => element.activeCell)

// 当前活动单元格
const handleCellClick = (cell: CellConfig, row: number, col: number) => {
  element.activeCell = cell
  element.activeRow = row
  element.activeCol = col
  // 获取选择插件 设置当前元素为选中状态
  const selectionPlugin = host.getPlugin<SelectionPlugin>('selection')
  selectionPlugin?.selectElement(element)
}
</script>
