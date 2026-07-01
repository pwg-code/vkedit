<template>
  <div class="vkedit-property__title">表格属性</div>
  <div></div>
  <div>
    <VkLabel>行数</VkLabel>
    <VkInputNumber
      :model-value="element.rowsHeight.length"
      :min="1"
      @update:model-value="
        (value) => {
          if (typeof value === 'number') updateRows(value)
        }
      "
    />
  </div>

  <div>
    <VkLabel>列数</VkLabel>
    <VkInputNumber
      :model-value="element.colsWidth.length"
      :min="1"
      @update:model-value="
        (value) => {
          if (typeof value === 'number') updateCols(value)
        }
      "
    />
  </div>
  <div class="vkedit-chart__section">
    单元格设置 ({{ element.activeRow + 1 }},{{ element.activeCol + 1 }})
  </div>
  <div></div>
  <div>
    <VkLabel>行高</VkLabel>
    <VkInputMM
      :model-value="element.rowsHeight[element.activeRow]"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `rowsHeight.${element.activeRow}`,
            element.rowsHeight[element.activeRow],
            value,
          )
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>列宽</VkLabel>
    <VkInputMM
      :dpm="hostState.dpm"
      :model-value="element.colsWidth[element.activeCol]"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `colsWidth.${element.activeCol}`,
            element.colsWidth[element.activeCol],
            value,
          )
        }
      "
    ></VkInputMM>
  </div>
  <div style="display: flex; gap: 1rem; align-items: center">
    <VkInputNumber v-model="resizeRow" />
    <VkInputNumber v-model="resizeCol" />
    <VkButton size="xs" variant="outline" @click="mergeCell()">合并</VkButton>
  </div>
  <div style="display: flex; gap: 1rem; align-items: center">
    <VkButton size="xs" variant="outline" @click="handleDissolve()">解除合并</VkButton>
  </div>
  <div></div>
  <div class="vkedit-property__col-full">
    <VkToggle
      :model-value="element.activeCell.borderUp"
      @update:model-value="(value: any) => updateActiveCellConfig('borderUp', value)"
    >
      <Icon icon="material-symbols-light:border-top" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="element.offset(1, 0)?.borderUp ?? false"
      @update:model-value="
        (value: any) =>
          updateCellConfig(element.activeRow + 1, element.activeCol, 'borderUp', value)
      "
    >
      <Icon icon="material-symbols-light:border-bottom" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle
      :model-value="element.activeCell.borderLeft"
      @update:model-value="(value: any) => updateActiveCellConfig('borderLeft', value)"
    >
      <Icon icon="material-symbols-light:border-left" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="element.offset(0, 1)?.borderLeft ?? false"
      @update:model-value="
        (value: any) =>
          updateCellConfig(element.activeRow, element.activeCol + 1, 'borderLeft', value)
      "
    >
      <Icon icon="material-symbols-light:border-right" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
  </div>

  <TextProperty
    :font-size="element.activeCell.fontSize"
    :align="element.activeCell.align"
    :font-style="element.activeCell.fontStyle"
    :vertical-align="element.activeCell.verticalAlign"
    :host="host"
    @update="updateActiveCellConfig"
  ></TextProperty>
</template>

<script setup lang="ts">
import { type EditorHost } from '@/core'
import type { CellConfig, TableElement } from './table'
import { VkLabel, VkButton, VkInput, VkInputMM, VkToggle, VkInputNumber } from '@/components/ui'
import TextProperty from '@/components/TextProperty.vue'
import { Icon } from '@iconify/vue'
import { BatchCommand, UpdatePropertyCommand, type ICommand } from '@/commands'
import { onMounted, ref, watch } from 'vue'
import { useHostState } from '@/hooks'

interface Props {
  host: EditorHost
  element: TableElement
  selection: TableElement[]
}

const { host, element, selection } = defineProps<Props>()

const { hostState } = useHostState(host)

// 更新行数
const updateRows = (value: number) => {
  // 差值
  const n = Math.abs(value - element.rowsHeight.length)
  for (let i = 0; i < n; i++) {
    if (value > element.rowsHeight.length) {
      element.addRow()
    } else {
      element.removeRow()
    }
  }
}

// 更新列数
const updateCols = (value: number) => {
  // 差值
  const n = Math.abs(value - element.colsWidth.length)
  for (let i = 0; i < n; i++) {
    if (value > element.colsWidth.length) {
      element.addCol()
    } else {
      element.removeCol()
    }
  }
}

// 更新字体对齐
const updateActiveCellConfig = (prop: string, value: any) => {
  updateCellConfig(element.activeRow, element.activeCol, prop, value)
}

// 更新字体对齐
const updateCellConfig = (row: number, col: number, prop: string, value: any) => {
  const cell = element.getCell(row, col)
  if (!cell) return
  host.executeCommand(
    new UpdatePropertyCommand(
      host,
      element,
      `cells.${row}.${col}.${prop}`,
      cell[prop as keyof typeof cell],
      value,
    ),
  )
}

// 解除单元格合并
const handleDissolve = () => {
  const comms = []
  let row = 1
  while (element.offset(row, 0) && element.offset(row, 0)?.mergeUp) {
    row++
  }
  let col = 1
  while (element.offset(0, col) && element.offset(0, col)?.mergeLeft) {
    col++
  }

  for (let rowI = 0; rowI < row; rowI++) {
    for (let colI = 0; colI < col; colI++) {
      const cell = element.offset(rowI, colI)
      if (cell) {
        comms.push(
          new UpdatePropertyCommand(
            host,
            element,
            `cells.${element.activeRow + rowI}.${element.activeCol + colI}.mergeLeft`,
            cell.mergeLeft,
            false,
          ),
        )
        comms.push(
          new UpdatePropertyCommand(
            host,
            element,
            `cells.${element.activeRow + rowI}.${element.activeCol + colI}.mergeUp`,
            cell.mergeUp,
            false,
          ),
        )
      }
    }
  }
  host.executeCommand(new BatchCommand(host, comms))
}

const resizeRow = ref(1)
const resizeCol = ref(1)
watch(resizeRow, (v) => {
  if (element.activeRow + v > element.rowCount) {
    resizeRow.value = element.rowCount - element.activeRow
  }
})
watch(resizeCol, (v) => {
  if (element.activeCol + v > element.rowCount) {
    resizeCol.value = element.colCount - element.activeCol
  }
})

// 合并单元格
const mergeCell = () => {
  const comms = []
  for (let i = 1; i < resizeRow.value + 1; i++) {
    for (let j = 1; j < resizeCol.value + 1; j++) {
      const cell = element.offset(i - 1, j - 1)
      if (cell) {
        if (j > 1) {
          comms.push(
            new UpdatePropertyCommand(
              host,
              element,
              `cells.${element.activeRow + i - 1}.${element.activeCol + j - 1}.mergeLeft`,
              cell.mergeLeft,
              true,
            ),
          )
        }
        if (i > 1) {
          comms.push(
            new UpdatePropertyCommand(
              host,
              element,
              `cells.${element.activeRow + i - 1}.${element.activeCol + j - 1}.mergeUp`,
              cell.mergeUp,
              true,
            ),
          )
        }
      }
    }
  }
  host.executeCommand(new BatchCommand(host, comms))
}

//
onMounted(() => {
  // 监听属性更新命令  如果设计表格线条相关 则重绘表格线
  host.on('element:updated', (e) => {
    if (e.elementId === element.id) {
      e.updatedProperties.forEach((prop) => {
        if (
          prop.includes('rowsHeight') ||
          prop.includes('colsWidth') ||
          prop.includes('merge') ||
          prop.includes('border')
        ) {
          element.updateCells()
        }
      })
    }
  })
})
</script>

<style scoped></style>
