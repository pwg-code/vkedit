<template>
  <v-group :config="element" v-bind="$attrs">
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
          />
        </template>
      </template>
    </template>
    <slot :host="host" :element="element"> </slot>
  </v-group>
  <!-- 高亮活动单元格 -->
  <v-rect v-if="activeCell" :config="highlightConfig" />
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core'
import type { CellConfig, TableElement } from './table'
import { computed, onMounted, ref } from 'vue'
import type { SelectionPlugin } from '../selection'
import CellsBorder from './CellsBorder.vue'

interface Props {
  element: TableElement
  host: EditorHost
}

const { element, host } = defineProps<Props>()

const cells = computed(() => element.cells)
const activeCell = computed(() => element.activeCell || null)

// 高亮单元格配置
const highlightConfig = computed(() => {
  return {
    x: activeCell.value.x + element.x,
    y: activeCell.value.y + element.y,
    width: activeCell.value.width,
    height: activeCell.value.height,
    stroke: 'green',
    strokeWidth: 4,
  }
})

// 当前活动单元格
const handleCellClick = (e: any, cell: CellConfig, row: number, col: number) => {
  element.activeCell = cell
  element.activeRow = row
  element.activeCol = col
  // 主动将选中状态同步到选择插件
  const selectionPlugin = host.getPlugin('selection-plugin')

  selectionPlugin.selectElement(element)
  // 停止事件冒泡
  e.cancelBubble = true
}
</script>
