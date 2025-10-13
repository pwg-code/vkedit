<template>
  <div class="">
    <div class="text-xl font-bold pb-2">表格属性</div>
    <ElForm>
      <ElDivider></ElDivider>
      <ElFormItem label="行数">
        <ElInputNumber
          :model-value="element.rowsHeight.length"
          @input="
            (value) => {
              if (typeof value === 'number') updateRows(value)
            }
          "
        />
      </ElFormItem>
      <ElFormItem label="列数">
        <ElInputNumber
          :model-value="element.colsWidth.length"
          @input="
            (value) => {
              if (typeof value === 'number') updateCols(value)
            }
          "
        />
      </ElFormItem>
      <div class="pt-5">单元格</div>
      <ElDivider></ElDivider>
      <div v-if="element.activeCell">
        <ElFormItem label="文本">
          <ElInput
            :model-value="element.activeCell.text"
            @input="
              (value: any) =>
                element.updateProperty(
                  host,
                  `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.text`,
                  element.activeCell.text,
                  value,
                )
            "
          ></ElInput>
        </ElFormItem>
        <ElFormItem label="字号">
          <ElInputNumber
            :model-value="element.activeCell.fontSize"
            @input="
              (value: any) =>
                element.updateProperty(
                  host,
                  `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.fontSize`,
                  element.activeCell.fontSize,
                  value,
                )
            "
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="行高">
          <ElInputNumber
            :model-value="element.rowsHeight[element.activeCell.rowIndex]"
            :min="0"
            @input="
              (value: any) =>
                element.updateProperty(
                  host,
                  `rowsHeight.${element.activeCell.rowIndex}`,
                  element.rowsHeight[element.activeCell.rowIndex],
                  value,
                )
            "
          ></ElInputNumber>
        </ElFormItem>
        <ElFormItem label="列宽">
          <ElInputNumber
            :model-value="element.colsWidth[element.activeCell.colIndex]"
            :min="0"
            @input="
              (value: any) =>
                element.updateProperty(
                  host,
                  `colsWidth.${element.activeCell.colIndex}`,
                  element.colsWidth[element.activeCell.colIndex],
                  value,
                )
            "
          ></ElInputNumber>
        </ElFormItem>
        <div class="flex gap-4">
          <ElFormItem label="合并左">
            <ElSwitch
              :model-value="element.activeCell.isMergeLeft"
              @input="
                (value: any) =>
                  element.updateProperty(
                    host,
                    `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.isMergeLeft`,
                    element.activeCell.isMergeLeft,
                    value,
                  )
              "
            ></ElSwitch>
          </ElFormItem>
          <ElFormItem label="合并上">
            <ElSwitch
              :model-value="element.activeCell.isMergeUp"
              @input="
                (value: any) =>
                  element.updateProperty(
                    host,
                    `cells.${element.activeCell.rowIndex}.${element.activeCell.colIndex}.isMergeUp`,
                    element.activeCell.isMergeUp,
                    value,
                  )
              "
            ></ElSwitch>
          </ElFormItem>
        </div>
      </div>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { TableElement } from './TablePlugin'
import {
  ElDivider,
  ElInputNumber,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
} from 'element-plus'

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
