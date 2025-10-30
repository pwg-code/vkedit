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
      @update:model-value="(value: any) => updateCellConfig(element.activeCell, 'text', value)"
    ></VkTextarea>
  </div>
  <div>
    <NumberField
      :model-value="element.rowsHeight[element.activeCell.rowIndex]"
      :min="0"
      @update:model-value="
        (value: any) =>
          element.updateProperty(
            host,
            `rowsHeight.${element.activeCell.rowIndex}`,
            element.rowsHeight[element.activeCell.rowIndex],
            value,
          )
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
      :model-value="element.colsWidth[element.activeCell.colIndex]"
      :min="0"
      @update:model-value="
        (value: any) =>
          element.updateProperty(
            host,
            `colsWidth.${element.activeCell.colIndex}`,
            element.colsWidth[element.activeCell.colIndex],
            value,
          )
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
    <Label>合并左</Label>
    <Switch
      :model-value="element.activeCell.mergeLeft"
      @update:model-value="(value: any) => updateCellConfig(element.activeCell, 'mergeLeft', value)"
    >
    </Switch>
  </div>
  <div class="flex gap-4 items-center">
    <Label>合并上</Label>
    <Switch
      :model-value="element.activeCell.mergeUp"
      @update:model-value="(value: any) => updateCellConfig(element.activeCell, 'mergeUp', value)"
    >
    </Switch>
  </div>
  <div class="flex gap-4 items-center">
    <VkButton size="xs" variant="outline" @click="handleDissolve(element.activeCell)"
      >解除合并</VkButton
    >
  </div>
  <div></div>
  <div class="col-span-full">
    <VkToggle
      :model-value="element.activeCell.borderUp"
      @update:model-value="(value: any) => updateCellConfig(element.activeCell, 'borderUp', value)"
    >
      <Icon icon="material-symbols-light:border-top" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="
        element.getCell(element.activeCell.rowIndex + 1, element.activeCell.colIndex)?.borderUp
      "
      @update:model-value="
        (value: any) =>
          updateCellConfig(
            element.getCell(element.activeCell.rowIndex + 1, element.activeCell.colIndex),
            'borderUp',
            value,
          )
      "
    >
      <Icon icon="material-symbols-light:border-bottom" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle
      :model-value="element.activeCell.borderLeft"
      @update:model-value="
        (value: any) => updateCellConfig(element.activeCell, 'borderLeft', value)
      "
    >
      <Icon icon="material-symbols-light:border-left" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="
        element.getCell(element.activeCell.rowIndex, element.activeCell.colIndex + 1)?.borderLeft
      "
      @update:model-value="
        (value: any) =>
          updateCellConfig(
            element.getCell(element.activeCell.rowIndex, element.activeCell.colIndex + 1),
            'borderLeft',
            value,
          )
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
        @update:model-value="
          (value: any) => updateCellConfig(element.activeCell, 'fontSize', value)
        "
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
        (value) => updateCellConfig(element.activeCell, 'fontStyle', value ? 'bold' : 'normal')
      "
    >
      <Icon icon="material-symbols-light:format-bold" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'left'"
      @update:model-value="updateCellConfig(element.activeCell, 'align', 'left')"
      ><Icon
        icon="material-symbols-light:align-justify-flex-start"
        style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'center'"
      @update:model-value="updateCellConfig(element.activeCell, 'align', 'center')"
      ><Icon icon="material-symbols-light:align-justify-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.align == 'right'"
      @update:model-value="updateCellConfig(element.activeCell, 'align', 'right')"
      ><Icon icon="material-symbols-light:align-justify-flex-end" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'top'"
      @update:model-value="updateCellConfig(element.activeCell, 'verticalAlign', 'top')"
      ><Icon icon="material-symbols-light:align-start" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'middle'"
      @update:model-value="updateCellConfig(element.activeCell, 'verticalAlign', 'middle')"
      ><Icon icon="material-symbols-light:align-center" style="width: 25px; height: 25px"
    /></VkToggle>
    <VkToggle
      :model-value="element.activeCell.verticalAlign == 'bottom'"
      @update:model-value="updateCellConfig(element.activeCell, 'verticalAlign', 'bottom')"
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
import { Switch } from '@/components/ui/switch'
import { Icon } from '@iconify/vue'
import { BatchCommand, UpdatePropertyCommand, type ICommand } from '@/commands'

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

// 解除单元格合并
const handleDissolve = (cell: CellConfig) => {
  // 下方的单元格
  const downCell = element.cells[cell.rowIndex + 1][cell.colIndex]
  // 右侧的单元格
  const rightCell = element.cells[cell.rowIndex][cell.colIndex + 1]

  if (downCell) {
    if (downCell.mergeUp) {
      downCell.mergeUp = false
      // 继续往下走
      handleDissolve(downCell)
    }
  }

  if (rightCell) {
    if (rightCell.mergeLeft) {
      rightCell.mergeLeft = false
      // 继续往右走
      handleDissolve(rightCell)
    }
  }
}

// 更新字体对齐
const updateCellConfig = (cell: CellConfig | undefined, prop: string, value: string) => {
  if (!cell) return
  host.executeCommand(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${cell.rowIndex}.${cell.colIndex}.${prop}`,
      cell[prop as keyof typeof cell],
      value,
    ),
  )
}
</script>

<style scoped></style>
