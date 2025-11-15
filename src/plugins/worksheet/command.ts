/*
自定义插入行 插入列 删除行 删除列 命令
*/

import { BaseCommand } from '@/commands'
import { WorksheetElement } from './worksheet'
import { Cell, type MergedRegion } from './cell'

/**
 * 插入行命令
 */
export class InsertRowCommand extends BaseCommand {
  public name = 'insert-row'
  private insertedIndex: number

  constructor(
    private worksheetElement: WorksheetElement,
    private afterIndex: number = -1,
    description?: string,
  ) {
    super(description || '插入行')
    this.insertedIndex = afterIndex === -1 ? worksheetElement.rowCount : afterIndex + 1
  }

  execute(): void {
    this.worksheetElement.addRow(this.afterIndex)
  }

  undo(): void {
    this.worksheetElement.removeRow(this.insertedIndex)
  }
}

/**
 * 插入列命令
 */
export class InsertColumnCommand extends BaseCommand {
  public name = 'insert-column'
  private insertedIndex: number

  constructor(
    private worksheetElement: WorksheetElement,
    private afterIndex: number = -1,
    description?: string,
  ) {
    super(description || '插入列')
    this.insertedIndex = afterIndex === -1 ? worksheetElement.colCount : afterIndex + 1
  }

  execute(): void {
    this.worksheetElement.addCol(this.afterIndex)
  }

  undo(): void {
    this.worksheetElement.removeCol(this.insertedIndex)
  }
}

/**
 * 删除行命令
 */
export class RemoveRowCommand extends BaseCommand {
  public name = 'remove-row'
  private removedRowHeight: number | null = null
  private removedCells: Cell[] | null = null
  private removedIndex: number | null = null

  constructor(
    private worksheetElement: WorksheetElement,
    private index: number = -1,
    description?: string,
  ) {
    super(description || '删除行')
  }

  execute(): void {
    const { removedCells, removedRowHeight, removeIndex } = this.worksheetElement.removeRow(
      this.index,
    )
    this.removedCells = removedCells
    this.removedRowHeight = removedRowHeight
    this.removedIndex = removeIndex
  }

  undo(): void {
    // 恢复删除的行
    if (
      this.removedIndex !== null &&
      this.removedCells !== null &&
      this.removedRowHeight !== null
    ) {
      this.worksheetElement.addRow(this.removedIndex - 1, this.removedCells, this.removedRowHeight)
    }
  }
}

/**
 * 删除列命令
 */
export class RemoveColumnCommand extends BaseCommand {
  public name = 'remove-column'
  private removedColWidth: number | null = null
  private removedCells: Cell[] | null = null
  private removedIndex: number | null = null

  constructor(
    private worksheetElement: WorksheetElement,
    private index: number = -1,
    description?: string,
  ) {
    super(description || '删除列')
  }

  execute(): void {
    const { removedCells, removedColWidth, removeIndex } = this.worksheetElement.removeCol(
      this.index,
    )
    this.removedCells = removedCells
    this.removedColWidth = removedColWidth
    this.removedIndex = removeIndex
  }

  undo(): void {
    // 恢复删除的列
    if (this.removedIndex !== null && this.removedCells !== null && this.removedColWidth !== null) {
      this.worksheetElement.addCol(this.removedIndex - 1, this.removedCells, this.removedColWidth)
    }
  }
}

/**
 * 合并单元格命令
 */
export class MergeCellsCommand extends BaseCommand {
  public name = 'merge-cells'
  private mergedRegionId: string | null = null
  // private originalCells: Array<{
  //   row: number
  //   col: number
  //   value: string
  //   mergedRegionId?: string
  // }> = []

  constructor(
    private worksheetElement: WorksheetElement,
    private startRow: number,
    private startCol: number,
    private endRow: number,
    private endCol: number,
    description?: string,
  ) {
    super(description || '合并单元格')

    // // 保存原始单元格数据以便撤销
    // for (let r = startRow; r <= endRow; r++) {
    //   for (let c = startCol; c <= endCol; c++) {
    //     const cell = this.worksheetElement.getCell(r, c)
    //     if (cell) {
    //       this.originalCells.push({
    //         row: r,
    //         col: c,
    //         value: cell.value || '',
    //         mergedRegionId: cell.mergedRegionId,
    //       })
    //     }
    //   }
    // }
  }

  execute(): void {
    try {
      this.mergedRegionId = this.worksheetElement.createMergedRegion(
        this.startRow,
        this.startCol,
        this.endRow,
        this.endCol,
      )
    } catch (error) {
      throw new Error(`合并单元格失败: ${error}`)
    }
  }

  undo(): void {
    if (this.mergedRegionId) {
      // 删除合并区域
      this.worksheetElement.removeMergedRegion(this.mergedRegionId)

      // // 恢复原始单元格数据
      // this.originalCells.forEach((cellData) => {
      //   const cell = this.worksheetElement.getCell(cellData.row, cellData.col)
      //   if (cell) {
      //     cell.value = cellData.value
      //     cell.mergedRegionId = cellData.mergedRegionId
      //   }
      // })

      this.mergedRegionId = null
    }
  }
}

/**
 * 取消合并单元格命令
 */
export class UnmergeCellsCommand extends BaseCommand {
  public name = 'unmerge-cells'
  private removedRegion: MergedRegion | null = null
  // private originalCells: Array<{
  //   row: number
  //   col: number
  //   value: string
  //   mergedRegionId: string
  // }> = []

  constructor(
    private worksheetElement: WorksheetElement,
    private regionId: string,
    description?: string,
  ) {
    super(description || '取消合并单元格')

    // 保存要删除的合并区域信息
    const region = this.worksheetElement.mergedRegions.get(regionId)
    if (region) {
      this.removedRegion = { ...region }

      // // 保存原始单元格数据以便撤销
      // for (let r = region.startRow; r <= region.endRow; r++) {
      //   for (let c = region.startCol; c <= region.endCol; c++) {
      //     const cell = this.worksheetElement.getCell(r, c)
      //     if (cell && cell.mergedRegionId === regionId) {
      //       this.originalCells.push({
      //         row: r,
      //         col: c,
      //         value: cell.value || '',
      //         mergedRegionId: regionId,
      //       })
      //     }
      //   }
      // }
    }
  }

  execute(): void {
    if (this.removedRegion) {
      this.worksheetElement.removeMergedRegion(this.removedRegion.id)
    }
  }

  undo(): void {
    if (this.removedRegion) {
      // 重新创建合并区域
      const newRegionId = this.worksheetElement.createMergedRegion(
        this.removedRegion.startRow,
        this.removedRegion.startCol,
        this.removedRegion.endRow,
        this.removedRegion.endCol,
      )

      // // 恢复原始单元格数据
      // this.originalCells.forEach((cellData) => {
      //   const cell = this.worksheetElement.getCell(cellData.row, cellData.col)
      //   if (cell) {
      //     cell.value = cellData.value
      //     cell.mergedRegionId = newRegionId
      //   }
      // })

      // // 如果合并区域有值，设置到合并区域
      // if (this.removedRegion.value) {
      //   const region = this.worksheetElement.mergedRegions.get(newRegionId)
      //   if (region) {
      //     region.value = this.removedRegion.value
      //   }
      // }
    }
  }
}
