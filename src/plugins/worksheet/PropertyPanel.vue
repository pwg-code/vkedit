<template>
  <div class="text-xl font-bold py-2">工作表属性</div>
  <div></div>
  <div class="pt-4 font-bold">
    单元格设置 ({{ activeCell ? activeCell?.row + 1 : 'NA' }},{{
      activeCell ? activeCell?.col + 1 : 'NA'
    }})
  </div>
  <div></div>
  <div>
    <Label>行高</Label>
    <VkInputMM
      :model-value="activeCell ? element.rowsHeight[activeCell.row] : 0"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `rowsHeight.${activeCell?.row}`,
            activeCell?.row ? element.rowsHeight[activeCell.row] : 0,
            value,
          )
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <Label>列宽</Label>
    <VkInputMM
      :dpm="hostState.dpm"
      :model-value="activeCell ? element.colsWidth[activeCell.col] : 0"
      @update:model-value="
        (value: any) => {
          element.updateProperty(
            host,
            `colsWidth.${activeCell?.col}`,
            activeCell ? element.colsWidth[activeCell.col] : 0,
            value,
          )
        }
      "
    ></VkInputMM>
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
      :model-value="hasBorder('top')"
      @update:model-value="(value) => updateBorder('top', value)"
    >
      <Icon icon="material-symbols-light:border-top" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="hasBorder('bottom')"
      @update:model-value="(value) => updateBorder('bottom', value)"
    >
      <Icon icon="material-symbols-light:border-bottom" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
    <VkToggle
      :model-value="hasBorder('left')"
      @update:model-value="(value) => updateBorder('left', value)"
    >
      <Icon icon="material-symbols-light:border-left" style="width: 25px; height: 25px"></Icon>
    </VkToggle>

    <VkToggle
      :model-value="hasBorder('right')"
      @update:model-value="(value) => updateBorder('right', value)"
    >
      <Icon icon="material-symbols-light:border-right" style="width: 25px; height: 25px"></Icon>
    </VkToggle>
  </div>

  <TextProperty
    :text="activeCell ? activeCell.cell.text : ''"
    :font-size="activeCell ? activeCell.cell.fontSize : 12"
    :align="activeCell ? activeCell.cell.align : 'left'"
    :font-style="activeCell ? activeCell.cell.fontStyle : 'normal'"
    :vertical-align="activeCell ? activeCell.cell.verticalAlign : 'top'"
    :host="host"
    @update="updateActiveCellConfig"
  ></TextProperty>
</template>

<script setup lang="ts">
import { type EditorHost } from '@/core'
import type { WorksheetElement } from './worksheet'
import { Label } from '@/components/ui/label'
import { VkButton, VkInput, VkInputMM, VkTextarea, VkToggle } from '@/components/ui'
import TextProperty from '@/components/TextProperty.vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Icon } from '@iconify/vue'
import { BatchCommand, UpdatePropertyCommand, type ICommand } from '@/commands'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useHostState } from '@/hooks'

interface Props {
  host: EditorHost
  element: WorksheetElement
  selection: WorksheetElement[]
}

const { host, element, selection } = defineProps<Props>()

const { hostState } = useHostState(host)

const activeCell = computed(() => (element.activeCell ? element.activeCell : null))

// 更新边框
const updateBorder = (side: 'top' | 'bottom' | 'left' | 'right', value: boolean) => {
  const prop = `border.${side}.style`
  // 取消边框需要同时取消下一个单元格的对应边框
  if (!activeCell.value) return
  const row = activeCell.value.row
  const col = activeCell.value.col
  let style = value ? 'thin' : undefined
  // 可能需要使用两个命令批量更新
  const comms: ICommand[] = []
  comms.push(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${row}.${col}.${prop}`,
      activeCell.value.cell.border?.[side]?.style,
      style,
    ),
  )
  // 不管开启还是关闭边框 都需要同步取消下个单元格的边框
  // 如果是左侧边框 还需要更新左侧单元格的右侧边框
  if (side === 'left' && col > 0) {
    comms.push(
      new UpdatePropertyCommand(
        element,
        host,
        `cells.${row}.${col - 1}.border.right.style`,
        element.getCell(row, col - 1)?.border?.right?.style,
        undefined,
      ),
    )
  }
  // 如果是上侧边框 还需要更新上侧单元格的下侧边框
  if (side === 'top' && row > 0) {
    comms.push(
      new UpdatePropertyCommand(
        element,
        host,
        `cells.${row - 1}.${col}.border.bottom.style`,
        element.getCell(row - 1, col)?.border?.bottom?.style,
        undefined,
      ),
    )
  }
  // 如果是下侧边框 还需要更新下侧单元格的上侧边框
  if (side === 'bottom' && row < element.rowCount - 1) {
    comms.push(
      new UpdatePropertyCommand(
        element,
        host,
        `cells.${row + 1}.${col}.border.top.style`,
        element.getCell(row + 1, col)?.border?.top?.style,
        undefined,
      ),
    )
  }
  // 如果是右侧边框 还需要更新右侧单元格的左侧边框
  if (side === 'right' && col < element.colCount - 1) {
    comms.push(
      new UpdatePropertyCommand(
        element,
        host,
        `cells.${row}.${col + 1}.border.left.style`,
        element.getCell(row, col + 1)?.border?.left?.style,
        undefined,
      ),
    )
  }
  // 执行批量命令
  host.executeCommand(new BatchCommand(host, comms))
}

// 是否有边框
const hasBorder = (side: 'top' | 'bottom' | 'left' | 'right') => {
  if (!activeCell.value) return false
  const borderStyle = activeCell.value.cell.border?.[side]?.style
  if (borderStyle === 'thin') return true
  // 还需要检查相邻单元格的边框
  if (side === 'left' && activeCell.value.col > 0) {
    // 左侧边框 还需要检查左侧单元格的右侧边框
    const leftCell = element.getCell(activeCell.value.row, activeCell.value.col - 1)
    const leftBorderStyle = leftCell?.border?.right?.style
    if (leftBorderStyle === 'thin') return true
  }
  if (side === 'top' && activeCell.value.row > 0) {
    // 上侧边框 还需要检查上侧单元格的下侧边框
    const topCell = element.getCell(activeCell.value.row - 1, activeCell.value.col)
    const topBorderStyle = topCell?.border?.bottom?.style
    if (topBorderStyle === 'thin') return true
  }
  if (side === 'right' && activeCell.value.col < element.colCount - 1) {
    // 右侧边框 还需要检查右侧单元格的左侧边框
    const rightCell = element.getCell(activeCell.value.row, activeCell.value.col + 1)
    const rightBorderStyle = rightCell?.border?.left?.style
    if (rightBorderStyle === 'thin') return true
  }
  if (side === 'bottom' && activeCell.value.row < element.rowCount - 1) {
    // 下侧边框 还需要检查下侧单元格的上侧边框
    const bottomCell = element.getCell(activeCell.value.row + 1, activeCell.value.col)
    const bottomBorderStyle = bottomCell?.border?.top?.style
    if (bottomBorderStyle === 'thin') return true
  }
  return false
}

//
const updateActiveCellConfig = (prop: string, value: any) => {
  if (!activeCell.value) return
  updateCellConfig(activeCell.value.row, activeCell.value.col, prop, value)
}

// 更新字体对齐
const updateCellConfig = (row: number, col: number, prop: string, value: any) => {
  const cell = element.getCell(row, col)
  if (!cell) return
  host.executeCommand(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${row}.${col}.${prop}`,
      cell[prop as keyof typeof cell],
      value,
    ),
  )
}

// 解除单元格合并
const handleDissolve = () => {
  const comms = []
  const cell = activeCell.value?.cell
  if (!cell || !cell.mergedCells) return
  comms.push(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${activeCell.value?.row}.${activeCell.value?.col}.mergedCells`,
      cell.mergedCells,
      undefined,
    ),
  )
  // 把合并范围内的其他单元格的master 也清除
  const mergedCells = cell.getMergedCells()
  if (!mergedCells) return
  mergedCells.forEach((c) => {
    comms.push(
      new UpdatePropertyCommand(
        element,
        host,
        `cells.${c.row}.${c.col}.master`,
        c.cell.master,
        undefined,
      ),
    )
  })

  host.executeCommand(new BatchCommand(host, comms))
}

// 调整合并范围
const resizeRow = ref(1)
const resizeCol = ref(1)

watch(resizeRow, (v) => {
  if (!activeCell.value) return
  if (activeCell.value.row + v > element.rowCount) {
    resizeRow.value = element.rowCount - activeCell.value.row
  }
})

watch(resizeCol, (v) => {
  if (!activeCell.value) return
  if (activeCell.value.col + v > element.colCount) {
    resizeCol.value = element.colCount - activeCell.value.col
  }
})

// 合并单元格
const mergeCell = () => {
  if (!activeCell.value) return
  const mergedCells = {
    masterRow: activeCell.value.row,
    masterCol: activeCell.value.col,
    rowSpan: resizeRow.value,
    colSpan: resizeCol.value,
  }
  const comms = []
  // 设置主单元格的合并范围
  comms.push(
    new UpdatePropertyCommand(
      element,
      host,
      `cells.${activeCell.value.row}.${activeCell.value.col}.mergedCells`,
      activeCell.value.cell.mergedCells,
      mergedCells,
    ),
  )
  // 设置其他单元格的master
  const range = element.getCellsInRange(
    activeCell.value.row,
    activeCell.value.col,
    activeCell.value.row + resizeRow.value - 1,
    activeCell.value.col + resizeCol.value - 1,
  )

  range.forEach((c) => {
    // 跳过主单元格
    if (c.row === activeCell.value?.row && c.col === activeCell.value?.col) return

    comms.push(
      new UpdatePropertyCommand(element, host, `cells.${c.row}.${c.col}.master`, c.cell.master, {
        row: activeCell.value!.row,
        col: activeCell.value!.col,
      }),
    )
  })
  host.executeCommand(new BatchCommand(host, comms))
}

//
onMounted(() => {
  // 监听属性更新命令  如果设计表格线条相关 则重绘表格线
  host.on('element:updated', (e) => {
    if (e.elementId === element.id) {
      e.updatedProperties.forEach((prop) => {
        // 需要重绘的属性
        if (
          prop.includes('rowsHeight') ||
          prop.includes('colsWidth') ||
          prop.includes('merge') ||
          prop.includes('border') ||
          prop.includes('master') ||
          prop.includes('visible')
        ) {
          element.updateCellsRenderData()
        }
      })
    }
  })
})
</script>

<style scoped></style>
