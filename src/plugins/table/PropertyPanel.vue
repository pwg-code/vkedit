<template>
  <div class="text-xl font-bold py-2">表格属性</div>
  <div></div>
  <NumberField
    :model-value="element.rowsHeight.length"
    :min="1"
    @update:model-value="
      (value) => {
        if (typeof value === 'number') updateRows(value)
      }
    "
  >
    <Label>行数</Label>
    <NumberFieldContent>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>

  <NumberField
    :model-value="element.colsWidth.length"
    :min="1"
    @update:model-value="
      (value) => {
        if (typeof value === 'number') updateCols(value)
      }
    "
  >
    <Label>列数</Label>
    <NumberFieldContent>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>

  <div class="pt-4 font-bold">单元格设置</div>
  <div></div>

  <div class="col-span-full">
    <Label>内容</Label>
    <VkTextarea
      :model-value="element.activeCell.text"
      @update:model-value="(value: any) => updateActiveCellConfig('text', value)"
    ></VkTextarea>
  </div>
  <div>
    <NumberField
      :model-value="element.rowsHeight[element.activeRow]"
      :min="0"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `rowsHeight.${element.activeRow}`,
            element.rowsHeight[element.activeRow],
            value,
          )
          element.updateCells()
        }
      "
    >
      <Label>行高</Label>
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div>
    <NumberField
      :model-value="element.colsWidth[element.activeCol]"
      :min="0"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `colsWidth.${element.activeCol}`,
            element.colsWidth[element.activeCol],
            value,
          )
          element.updateCells()
        }
      "
    >
      <Label>列宽</Label>
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
  <div class="flex gap-4 items-center">
    <NumberField v-model="resizeRow">
      <NumberFieldContent>
        <NumberFieldInput />
      </NumberFieldContent>
    </NumberField>
    <NumberField v-model="resizeCol">
      <NumberFieldContent>
        <NumberFieldInput />
      </NumberFieldContent>
    </NumberField>
    <VkButton size="xs" variant="outline" @click="mergeCell()">合并</VkButton>
  </div>
  <div class="flex gap-4 items-center">
    <VkButton size="xs" variant="outline" @click="handleDissolve()">解除合并</VkButton>
  </div>
  <div></div>
  <div class="col-span-full">
    <VkToggle
      :model-value="element.activeCell.borderUp"
      @update:model-value="(value: any) => updateActiveCellConfig('borderUp', value)"
    >
      <Icon icon="material-symbols-light:border-top" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="element.getCell(element.activeRow + 1, element.activeCol)?.borderUp"
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
      :model-value="element.getCell(element.activeRow, element.activeCol + 1)?.borderLeft"
      @update:model-value="
        (value: any) =>
          updateCellConfig(element.activeRow, element.activeCol + 1, 'borderLeft', value)
      "
    >
      <Icon icon="material-symbols-light:border-right" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
  </div>
  <div class="col-span-full flex">
    <div class="min-w-[100px]">
      <NumberField
        :model-value="element.activeCell.fontSize"
        :min="0"
        @update:model-value="(value: any) => updateActiveCellConfig('fontSize', value)"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
    </div>
    <VkToggle
      :model-value="element.activeCell.fontStyle == 'bold'"
      @update:model-value="
        (value) => updateActiveCellConfig('fontStyle', value ? 'bold' : 'normal')
      "
    >
      <Icon icon="material-symbols-light:format-bold" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'left'"
      @update:model-value="updateActiveCellConfig('align', 'left')"
      ><Icon
        icon="material-symbols-light:align-justify-flex-start"
        style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'center'"
      @update:model-value="updateActiveCellConfig('align', 'center')"
      ><Icon icon="material-symbols-light:align-justify-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'right'"
      @update:model-value="updateActiveCellConfig('align', 'right')"
      ><Icon icon="material-symbols-light:align-justify-flex-end" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'top'"
      @update:model-value="updateActiveCellConfig('verticalAlign', 'top')"
      ><Icon icon="material-symbols-light:align-start" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'middle'"
      @update:model-value="updateActiveCellConfig('verticalAlign', 'middle')"
      ><Icon icon="material-symbols-light:align-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'bottom'"
      @update:model-value="updateActiveCellConfig('verticalAlign', 'bottom')"
      ><Icon icon="material-symbols-light:align-end" style="width: 25px; height: 25px"
    /></VkToggle>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { CellConfig, TableElement } from './table-plugin'
import { Label } from '@/components/ui/label'
import { VkButton, VkInput, VkTextarea, VkToggle } from '@/components/ui'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Icon } from '@iconify/vue'
import { BatchCommand, UpdatePropertyCommand, type ICommand } from '@/commands'
import { ref, watch } from 'vue'

interface Props {
  host: IEditorHost
  element: TableElement
  selection: TableElement[]
}

const { host, element, selection } = defineProps<Props>()

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
  const cell = element.cells[row][col]
  if (!cell) return
  host.executeCommand(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${element.activeRow}.${element.activeCol}.${prop}`,
      cell[prop as keyof typeof cell],
      value,
    ),
  )
}

// 解除单元格合并
const handleDissolve = () => {
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
        cell.mergeLeft = false
        cell.mergeUp = false
      }
    }
  }
  element.updateCells()
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
  for (let i = 1; i < resizeRow.value + 1; i++) {
    for (let j = 1; j < resizeCol.value + 1; j++) {
      const cell = element.offset(i - 1, j - 1)
      if (cell) {
        if (j > 1) {
          cell.mergeLeft = true
        }
        if (i > 1) {
          cell.mergeUp = true
        }
      }
    }
  }
  element.updateCells()
}
</script>

<style scoped></style>
