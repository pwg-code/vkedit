<template>
  <v-group :config="element">
    <template v-for="(row, rowIndex) in element.cells" :key="`row-${rowIndex}`">
      <template v-for="(cell, colIndex) in row" :key="`cell-${rowIndex}-${colIndex}`">
        <!-- 如果单元格已经是合并状态则不渲染 -->
        <template v-if="!cell.mergeLeft && !cell.mergeUp">
          <!-- 绘制边框 线-->
          <v-line :config="getUpBorderConfig(rowIndex, colIndex, cell)"></v-line>
          <v-line :config="getDownBorderConfig(rowIndex, colIndex, cell)"></v-line>
          <v-line :config="getLeftBorderConfig(rowIndex, colIndex, cell)"></v-line>
          <v-line :config="getRightBorderConfig(rowIndex, colIndex, cell)"></v-line>
          <!-- 单元格  矩形 -->
          <v-rect
            :config="getCellConfig(rowIndex, colIndex, cell)"
            @click="handleCellClick($event, rowIndex, colIndex, cell)"
          />

          <!-- 单元格内容 文本 -->
          <v-text
            :config="getTextConfig(rowIndex, colIndex, cell)"
            @click="handleCellClick($event, rowIndex, colIndex, cell)"
          />
        </template>
      </template>
    </template>
  </v-group>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { CellConfig, TableElement } from './table-plugin'
import { ref } from 'vue'
import type { SelectionPlugin } from '../selection-plugin'

interface Props {
  element: TableElement
  host: IEditorHost
}

const { element, host } = defineProps<Props>()

const getCellConfig = (row: number, col: number, cell: CellConfig) => {
  // 单元格边框
  let stroke = ''
  let strokeWidth = 0

  if (element.activeCell?.rowIndex == row && element.activeCell.colIndex == col) {
    // 选中的单元格  边框为绿色
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
    if (!element.cells[row][i].mergeLeft) break
    width = width + element.colsWidth[i]
  }
  return width
}

// 计算单元格的高度
const getCellHeight = (row: number, col: number) => {
  let height = element.rowsHeight[row]
  // 从当前索引往下走 如果下个单元格是合并的则把宽加到当前单元格
  for (var i = row + 1; i < element.rowsHeight.length; i++) {
    if (!element.cells[i][col].mergeUp) break
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

// 上边框配置
const getUpBorderConfig = (rowIndex: number, colIndex: number, cell: CellConfig) => {
  const x = getCellX(colIndex)
  const y = getCellY(rowIndex)
  const width = getCellWidth(rowIndex, colIndex)
  // const height = getCellHeight(rowIndex, colIndex)
  if (cell.borderUp) {
    return {
      points: [x, y, x + width, y],
      stroke: 'block',
      strokeWidth: 1,
    }
  } else {
    return {
      points: [x, y, x + width, y],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    }
  }
}

// 下边框配置
const getDownBorderConfig = (rowIndex: number, colIndex: number, cell: CellConfig) => {
  // 如果不是最后一行 则不渲染边框
  if (rowIndex !== element.rowsHeight.length - 1) return {}

  const x = getCellX(colIndex)
  const y = getCellY(rowIndex)
  const width = getCellWidth(rowIndex, colIndex)
  const height = getCellHeight(rowIndex, colIndex)

  if (cell.borderDown) {
    return {
      points: [x, y + height, x + width, y + height],
      stroke: 'block',
      strokeWidth: 1,
    }
  } else {
    return {
      points: [x, y + height, x + width, y + height],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    }
  }
}

// 左边框配置
const getLeftBorderConfig = (rowIndex: number, colIndex: number, cell: CellConfig) => {
  const x = getCellX(colIndex)
  const y = getCellY(rowIndex)
  // const width = getCellWidth(rowIndex, colIndex)
  const height = getCellHeight(rowIndex, colIndex)
  if (cell.borderLeft) {
    return {
      points: [x, y, x, y + height],
      stroke: 'block',
      strokeWidth: 1,
    }
  } else {
    return {
      points: [x, y, x, y + height],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    }
  }
}

// 右边框配置
const getRightBorderConfig = (rowIndex: number, colIndex: number, cell: CellConfig) => {
  // 如果不是最后一列 则不渲染边框
  if (colIndex !== element.colsWidth.length - 1) return {}

  const x = getCellX(colIndex)
  const y = getCellY(rowIndex)
  const width = getCellWidth(rowIndex, colIndex)
  const height = getCellHeight(rowIndex, colIndex)
  if (cell.borderRight) {
    return {
      points: [x + width, y, x + width, y + height],
      stroke: 'block',
      strokeWidth: 1,
    }
  } else {
    return {
      points: [x + width, y, x + width, y + height],
      stroke: '#e5e7eb',
      strokeWidth: 1,
    }
  }
}
</script>
