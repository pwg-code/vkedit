<template>
  <div class="">
    <div class="text-xl font-bold py-2">表格属性</div>
    <div class="flex flex-col-2 gap-2">
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
    </div>

    <div class="pt-4 font-bold">单元格设置</div>
    <div v-if="element.activeCell" class="grid grid-cols-2 gap-4 py-2">
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
          :model-value="element.activeCell.isMergeLeft"
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.isMergeLeft`,
                element.activeCell.isMergeLeft,
                value,
              )
          "
        >
        </Switch>
      </div>
      <div class="flex gap-4 items-center">
        <Label>合并上</Label>
        <Switch
          :model-value="element.activeCell.isMergeUp"
          @update:model-value="
            (value: any) =>
              element.updateProperty(
                host,
                `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.isMergeUp`,
                element.activeCell.isMergeUp,
                value,
              )
          "
        >
        </Switch>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { TableElement } from './TablePlugin'
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
}

const { element, host } = defineProps<Props>()

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
</script>

<style scoped></style>
