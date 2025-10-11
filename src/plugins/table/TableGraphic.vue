<template>
  <v-group :config="element">
    <template v-for="(row, rowIndex) in element.cells" :key="`row-${rowIndex}`">
      <template v-for="(cell, colIndex) in row" :key="`cell-${rowIndex}-${colIndex}`">
        <v-rect
          v-if="!cell.isMergeLeft && !cell.isMergeUp"
          :config="getCellConfig(rowIndex, colIndex, cell)"
          @click="handleCellClick($event, rowIndex, colIndex, cell)"
        />
        <v-text
          v-if="!cell.isMergeLeft && !cell.isMergeUp"
          :config="getTextConfig(rowIndex, colIndex, cell)"
        />
      </template>
    </template>
  </v-group>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { CellConfig, TableElement } from './TablePlugin'
import { ref } from 'vue'
import type { SelectionPlugin } from '../SelectionPlugin'

interface Props {
  element: TableElement
  host: IEditorHost
}

const { element, host } = defineProps<Props>()

const getCellConfig = (row: number, col: number, cell: CellConfig) => {
  // 活动单元格边框为蓝色
  let stroke = 'black'
  let strokeWidth = 1
  if (element.activeCell?.rowIndex == row && element.activeCell.colIndex == col) {
    stroke = 'green'
    strokeWidth = 3
  }
  return {
    x: getCellX(col),
    y: getCellY(row),
    width: getCellWidth(row, col),
    height: getCellHeight(row, col),
    stroke: stroke,
    strokeWidth: strokeWidth,
  }
}

const getTextConfig = (row: number, col: number, cell: CellConfig) => {
  return {
    x: getCellX(col) + 5,
    y: getCellY(row) + 10,
    ...cell,
  }
}

// 计算x的位置
const getCellX = (col: number) => {
  let x = 0
  for (var i = 0; i < col; i++) {
    x = x + element.colsWidth[i]
  }
  return x
}

// 计算y的位置
const getCellY = (row: number) => {
  let y = 0
  for (var i = 0; i < row; i++) {
    y = y + element.rowsHeight[i]
  }
  return y
}

// 计算单元格的宽度
const getCellWidth = (row: number, col: number) => {
  let width = element.colsWidth[col]
  // 从当前索引往前走 如果下个单元格是合并的则把宽加到当前单元格
  for (var i = col + 1; i < element.colsWidth.length; i++) {
    if (!element.cells[row][i].isMergeLeft) break
    width = width + element.colsWidth[i]
  }
  return width
}

// 计算单元格的高度
const getCellHeight = (row: number, col: number) => {
  let height = element.rowsHeight[row]
  // 从当前索引往下走 如果下个单元格是合并的则把宽加到当前单元格
  for (var i = row + 1; i < element.rowsHeight.length; i++) {
    if (!element.cells[i][col].isMergeUp) break
    height = height + element.rowsHeight[i]
  }
  return height
}

// 当前活动单元格
const handleCellClick = (event: any, rowIndex: number, colIndex: number, cell: CellConfig) => {
  element.activeCell = cell
  // 获取选择插件 设置当前元素为选中状态
  const selectionPlugin = host.getPlugin<SelectionPlugin>('selection')
  selectionPlugin?.selectElement(element)
}
</script>
