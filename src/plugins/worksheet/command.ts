/*
自定义插入行 插入列 删除行 删除列 命令
*/

import { BaseCommand } from '@/commands'
import { WorksheetElement } from './worksheet'
import { Cell } from './cell'

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
  private removedRowHeight: number
  private removedCells: Cell[]
  private removedIndex: number

  constructor(
    private worksheetElement: WorksheetElement,
    private index: number = -1,
    description?: string,
  ) {
    super(description || '删除行')
    this.removedIndex = index === -1 ? worksheetElement.rowCount - 1 : index

    // 保存要删除的行数据以便撤销
    this.removedRowHeight = worksheetElement.rowsHeight[this.removedIndex]
    this.removedCells = [...worksheetElement.cells[this.removedIndex]]
  }

  execute(): void {
    this.worksheetElement.removeRow(this.index)
  }

  undo(): void {
    // 恢复删除的行
    if (this.removedIndex >= this.worksheetElement.rowCount) {
      // 在末尾添加
      this.worksheetElement.cells.push(this.removedCells)
      this.worksheetElement.rowsHeight.push(this.removedRowHeight)
    } else {
      // 在指定位置插入
      this.worksheetElement.cells.splice(this.removedIndex, 0, this.removedCells)
      this.worksheetElement.rowsHeight.splice(this.removedIndex, 0, this.removedRowHeight)
    }
  }
}

/**
 * 删除列命令
 */
export class RemoveColumnCommand extends BaseCommand {
  public name = 'remove-column'
  private removedColWidth: number
  private removedCells: Cell[]
  private removedIndex: number

  constructor(
    private worksheetElement: WorksheetElement,
    private index: number = -1,
    description?: string,
  ) {
    super(description || '删除列')
    this.removedIndex = index === -1 ? worksheetElement.colCount - 1 : index

    // 保存要删除的列数据以便撤销
    this.removedColWidth = worksheetElement.colsWidth[this.removedIndex]
    this.removedCells = worksheetElement.cells.map((row) => row[this.removedIndex])
  }

  execute(): void {
    this.worksheetElement.removeCol(this.index)
  }

  undo(): void {
    // 恢复删除的列
    if (this.removedIndex >= this.worksheetElement.colCount) {
      // 在末尾添加
      this.worksheetElement.cells.forEach((row, rowIndex) => {
        row.push(this.removedCells[rowIndex])
      })
      this.worksheetElement.colsWidth.push(this.removedColWidth)
    } else {
      // 在指定位置插入
      this.worksheetElement.cells.forEach((row, rowIndex) => {
        row.splice(this.removedIndex, 0, this.removedCells[rowIndex])
      })
      this.worksheetElement.colsWidth.splice(this.removedIndex, 0, this.removedColWidth)
    }
  }
}
