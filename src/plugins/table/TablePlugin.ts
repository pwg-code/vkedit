import { BasePlugin } from '../../types/BasePlugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/BaseGraphicElement'
import { EditorEvents } from '@/types/EventTypes'
import type { Component } from 'vue'

export interface CellConfig {
  rowIndex: number
  colIndex: number
  fill: string
  text: string
  mergeLeft: boolean // 合并左
  mergeUp: boolean // 合并上
  borderUp: boolean
  // borderDown: boolean
  borderLeft: boolean
  // borderRight: boolean
  fontSize: number
  [key: string]: any
}

// 元素实现
export class TableElement extends BaseGraphicElement {
  // export class TableElement implements IGraphicElement {
  [key: string]: any
  public readonly type = 'table'
  public activeCell: CellConfig
  constructor(
    x: number = 50,
    y: number = 50,
    public rowsHeight: number[] = [30, 30, 30, 30], // 行高
    public colsWidth: number[] = [80, 80, 80, 80, 80, 80], // 列宽
    public cells: CellConfig[][] = [], // 单元格配置
  ) {
    super(x, y)
    // 如果没有提供单元格数据则 初始化单元格
    if (cells.length === 0) this.initCells()
    this.activeCell = this.cells[0][0]
    // 自动计算宽高
    this.initWidthHeight()
  }

  private initWidthHeight() {
    this.width = this.colsWidth.reduce((acc, curr) => acc + curr, 0)
    this.height = this.rowsHeight.reduce((acc, curr) => acc + curr, 0)
  }

  // 初始化单元格
  private initCells() {
    this.cells = this.rowsHeight.map((rowHeight, rowIndex) => {
      return this.colsWidth.map((colWidth, colIndex) => {
        return this.getDefaultCellConfig(rowIndex, colIndex)
      })
    })
  }

  // 获取默认的单元格配置
  private getDefaultCellConfig(rowIndex: number, colIndex: number) {
    return {
      rowIndex: rowIndex,
      colIndex: colIndex,
      fill: '#000000',
      text: '',
      mergeLeft: false,
      mergeUp: false,
      borderUp: true,
      borderDown: true,
      borderLeft: true,
      borderRight: true,
      fontSize: 14,
      borders: ['up', 'down', 'left', 'right'],
    }
  }

  // 增加一行
  public addRow(after: number = -1) {
    const rowIndex = after == -1 ? this.rowsHeight.length : after
    const row = this.colsWidth.map((colWidth, colIndex) => {
      return this.getDefaultCellConfig(rowIndex, colIndex)
    })
    // 在末尾插入
    if (after === -1) {
      this.cells.push(row)
      this.rowsHeight.push(40)
    } else {
      // 在指定位置插入
      this.cells = [...this.cells.slice(0, after + 1), row, ...this.cells.slice(after + 1)]
      this.rowsHeight = [
        ...this.rowsHeight.slice(0, after + 1),
        40,
        ...this.rowsHeight.slice(after + 1),
      ]
    }
    this.initWidthHeight()
  }

  // 删除一行
  public removeRow(index: number = -1) {
    if (index == -1) {
      this.cells.pop()
      this.rowsHeight.pop()
    } else {
      this.cells.splice(index, 1)
      this.rowsHeight.splice(index, 1)
    }
    this.initWidthHeight()
  }

  // 增加一列
  public addCol(after: number = -1) {
    const colIndex = after == -1 ? this.colsWidth.length : after

    if (after == -1) {
      this.cells.forEach((row, rowIndex) => {
        row.push(this.getDefaultCellConfig(rowIndex, colIndex))
      })
      this.colsWidth.push(100)
    } else {
      this.cells.forEach((row, rowIndex) => {
        this.cells[rowIndex] = [
          ...row.slice(0, after + 1),
          this.getDefaultCellConfig(rowIndex, colIndex),
          ...row.slice(after + 1),
        ]
      })
      this.colsWidth = [
        ...this.colsWidth.slice(0, after + 1),
        100,
        ...this.colsWidth.slice(after + 1),
      ]
    }
    this.initWidthHeight()
  }

  // 删除一列
  public removeCol(index: number = -1) {
    if (index == -1) {
      this.cells.forEach((row) => {
        row.pop()
      })
      this.colsWidth.pop()
    } else {
      this.cells.forEach((row, i) => {
        row.splice(index, 1)
      })
      this.colsWidth.splice(index, 1)
    }
    this.initWidthHeight()
  }

  clone(): IGraphicElement {
    const newElement = new TableElement()
    newElement.deserialize(this)
    return newElement
  }

  serialize() {
    return {
      ...super.serialize(),
      rowsHeight: this.rowsHeight,
      colsWidth: this.colsWidth,
      cells: this.cells,
    }
  }

  // 获取单元格
  getCell(row: number = 0, col: number = 0): CellConfig | undefined {
    const a = this.cells[row]
    if (a) {
      const b = a[col]
      if (b) {
        return b
      }
    }
  }
}

export class TableGraphicType extends BaseGraphicType {
  type: string = 'table'
  render(): Component {
    return Shape
  }
  renderPropertyPanel(): Component {
    return PropertyPanel
  }
  renderTool(): Component {
    return Tool
  }
  createElement(x: number, y: number): IGraphicElement {
    return new TableElement()
  }
}

export class TablePlugin extends BasePlugin {
  public name = 'table-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册表格图形类型
    this.host.emit(EditorEvents.GRAPHIC_TYPE_REGISTERED, new TableGraphicType())
  }
}
