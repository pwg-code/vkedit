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

  <div>
    <Label>内容</Label>
    <Input
      :model-value="element.activeCell.text"
      @update:model-value="
        (value: any) =>
          element.updateProperty(
            host,
            `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.text`,
            element.activeCell.text,
            value,
          )
      "
    >
    </Input>
  </div>
  <div></div>
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
      @update:model-value="
        (value: any) =>
          element.updateProperty(
            host,
            `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.mergeLeft`,
            element.activeCell.mergeLeft,
            value,
          )
      "
    >
    </Switch>
  </div>
  <div class="flex gap-4 items-center">
    <Label>合并上</Label>
    <Switch
      :model-value="element.activeCell.mergeUp"
      @update:model-value="
        (value: any) =>
          element.updateProperty(
            host,
            `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.mergeUp`,
            element.activeCell.mergeUp,
            value,
          )
      "
    >
    </Switch>
  </div>
  <div>
    <Label>边框</Label>
    <div class="grid grid-cols-3 border-2 border-border">
      <div></div>
      <div class="flex gap-4 items-center">
        <Switch
          :model-value="element.activeCell.borderUp"
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.borderUp`,
                element.activeCell.borderUp,
                value,
              )
          "
        >
        </Switch>
      </div>
      <div></div>
      <div class="flex gap-4 items-center">
        <Switch
          :model-value="element.activeCell.borderLeft"
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.borderLeft`,
                element.activeCell.borderLeft,
                value,
              )
          "
        >
        </Switch>
      </div>
      <div></div>
      <div class="flex gap-4 items-center">
        <Switch
          :model-value="
            element.getCell(element.activeCell.rowIndex, element.activeCell.colIndex + 1)
              ?.borderLeft
          "
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex + 1}.borderLeft`,
                element.getCell(element.activeCell.rowIndex, element.activeCell.colIndex + 1)
                  ?.borderLeft,
                value,
              )
          "
        >
        </Switch>
      </div>
      <div></div>
      <div class="flex gap-4 items-center">
        <Switch
          :model-value="
            element.getCell(element.activeCell.rowIndex + 1, element.activeCell.colIndex)?.borderUp
          "
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex + 1}.${element.activeCell.colIndex}.borderUp`,
                element.getCell(element.activeCell.rowIndex + 1, element.activeCell.colIndex)
                  ?.borderUp,
                value,
              )
          "
        >
        </Switch>
      </div>
      <div></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost, IGraphicElement } from '@/types'
import type { TableElement } from './table-plugin'
import { Label } from '@/components/ui/label'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

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

// 设置上边框  同时设置上一个单元格的边框
// const setBorderUp = (element: TableElement, value: any) => {
//   element.updateProperty(
//     host,
//     `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.borderUp`,
//     element.activeCell.borderUp,
//     value,
//   )
//   element.updateProperty(
//     host,
//     `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.borderUp`,
//     element.activeCell.borderUp,
//     value,
//   )
// }
</script>

<style scoped></style>
