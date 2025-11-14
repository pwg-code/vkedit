import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import ContextMenu from './ContextMenu.vue'
import { Cell, type CellBorder } from './cell'

import { sum } from 'lodash'

// 单元格渲染数据定义 根据Cell计算 用于快速渲染表格
export interface CellRenderData {
  x: number
  y: number
  width: number
  height: number
  cell: Cell
  row: number
  col: number
}

// 元素实现
export class WorksheetElement extends BaseGraphicElement {
  public type = 'worksheet'
  public activeCell: CellRenderData | null = null
  // 所有单元格的渲染数据缓存 用于快速渲染
  public cellsRenderData: CellRenderData[][] = []

  constructor(
    x: number = 5,
    y: number = 5,
    public rowsHeight: number[] = Array(4).fill(30), // 行高
    public colsWidth: number[] = Array(5).fill(70), // 列宽
    public cells: Cell[][] = [], // 单元格配置
  ) {
    super(x, y)
    this.draggable = false
    // 如果没有提供单元格数据则 初始化单元格
    if (cells.length === 0) this.initCells()
    // 初始化单元格渲染数据
    this.updateCellsRenderData()
    // 初始化宽高
    this.updateWidthHeight()
    // 设置默认活动单元格
    this.setActiveCell(0, 0)
  }

  // 更新单元格渲染数据
  public updateCellsRenderData() {
    const data: CellRenderData[][] = []
    this.rowsHeight.forEach((rowHeight, rowIndex) => {
      const y = sum(this.rowsHeight.slice(0, rowIndex))
      const rowData: CellRenderData[] = []
      data.push(rowData)
      this.colsWidth.forEach((colWidth, colIndex) => {
        const x = sum(this.colsWidth.slice(0, colIndex))
        // 根据单元格合并信息计算宽高
        const cell = this.cells[rowIndex][colIndex]
        let width = colWidth
        let height = rowHeight
        if (cell.mergedCells) {
          const { masterRow, masterCol, rowSpan, colSpan } = cell.mergedCells
          width = sum(this.colsWidth.slice(masterCol, masterCol + colSpan))
          height = sum(this.rowsHeight.slice(masterRow, masterRow + rowSpan))
        }
        rowData.push({
          x,
          y,
          width,
          height,
          cell,
          row: rowIndex,
          col: colIndex,
        })
      })
    })
    this.cellsRenderData = data
    // 重设一下活动单元格  触发刷新
    this.setActiveCell(
      this.activeCell ? this.activeCell.row : 0,
      this.activeCell ? this.activeCell.col : 0,
    )
  }

  // 初始化当前元素的宽高
  public updateWidthHeight() {
    this.width = this.colsWidth.reduce((acc, curr) => acc + curr, 0)
    this.height = this.rowsHeight.reduce((acc, curr) => acc + curr, 0)
  }

  // 初始化单元格
  public initCells() {
    this.cells = this.rowsHeight.map((rowHeight, rowIndex) => {
      return this.colsWidth.map((colWidth, colIndex) => {
        return this.getDefaultCell(rowIndex, colIndex)
      })
    })
  }

  // 更新活动单元格
  public setActiveCell(rowIndex: number, colIndex: number) {
    this.activeCell = this.cellsRenderData[rowIndex][colIndex]
  }

  // 获取默认的单元格配置
  public getDefaultCell(rowIndex: number, colIndex: number): Cell {
    return new Cell(this)
  }

  // 增加一行
  public addRow(after: number = -1) {
    const rowIndex = after == -1 ? this.rowsHeight.length : after

    let rowHeight = 0
    // 获取当前行高
    if (rowIndex < 0) {
      rowHeight = this.rowsHeight[rowIndex - 1]
    } else if (rowIndex >= this.rowsHeight.length) {
      rowHeight = this.rowsHeight[this.rowsHeight.length - 1]
    } else {
      rowHeight = this.rowsHeight[rowIndex]
    }

    const row = this.colsWidth.map((colWidth, colIndex) => {
      return this.getDefaultCell(rowIndex, colIndex)
    })
    // 在末尾插入
    if (after === -1) {
      this.cells.push(row)
      this.rowsHeight.push(rowHeight)
    } else {
      // 在指定位置插入
      this.cells = [...this.cells.slice(0, after + 1), row, ...this.cells.slice(after + 1)]
      this.rowsHeight = [
        ...this.rowsHeight.slice(0, after + 1),
        rowHeight,
        ...this.rowsHeight.slice(after + 1),
      ]
    }
    // 更新单元格渲染数据
    this.updateCellsRenderData()
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
    this.updateCellsRenderData()
    // 如果删除的是当前行 则清除选中
    if (this.activeCell?.row === index) {
      this.activeCell = null
    }
  }

  // 增加一列
  public addCol(after: number = -1) {
    const colIndex = after == -1 ? this.colsWidth.length : after
    let colWidth = 0
    // 获取当前列宽
    if (colIndex < 0) {
      colWidth = this.colsWidth[colIndex - 1]
    } else if (colIndex >= this.colsWidth.length) {
      colWidth = this.colsWidth[this.colsWidth.length - 1]
    } else {
      colWidth = this.colsWidth[colIndex]
    }

    if (after == -1) {
      this.cells.forEach((row, rowIndex) => {
        row.push(this.getDefaultCell(rowIndex, colIndex))
      })
      this.colsWidth.push(colWidth)
    } else {
      this.cells.forEach((row, rowIndex) => {
        this.cells[rowIndex] = [
          ...row.slice(0, after + 1),
          this.getDefaultCell(rowIndex, colIndex),
          ...row.slice(after + 1),
        ]
      })
      this.colsWidth = [
        ...this.colsWidth.slice(0, after + 1),
        colWidth,
        ...this.colsWidth.slice(after + 1),
      ]
    }
    this.updateCellsRenderData()
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
    this.updateCellsRenderData()
    // 如果删除的列是活动单元格的列 则清除选中
    if (this.activeCell?.col === index) {
      this.activeCell = null
    }
  }

  clone(): IGraphicElement {
    const newElement = new WorksheetElement()
    newElement.deserialize(this)
    return newElement
  }

  deserialize(data: any): void {
    super.deserialize(data)
    this.cells = data.cells.map((rowData: any[]) =>
      rowData.map((cellData) => {
        const cell = new Cell(this)
        cell.deserialize(cellData)
        return cell
      }),
    )
    this.rowsHeight = data.rowsHeight
    this.colsWidth = data.colsWidth
    this.updateCellsRenderData()
    this.updateWidthHeight()
  }

  serialize() {
    return {
      ...super.serialize(),
      rowsHeight: this.rowsHeight,
      colsWidth: this.colsWidth,
      cells: this.cells.map(row=>row.map(c=>c.serialize())),
    }
  }

  // 获取单元格
  getCell(row: number = 0, col: number = 0): Cell | undefined {
    const a = this.cells[row]
    if (a) {
      const b = a[col]
      if (b) {
        return b
      }
    }
  }

  // 获取一个范围区间的单元格
  getCellsInRange(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ): { cell: Cell; row: number; col: number }[] {
    const cellsInRange: { cell: Cell; row: number; col: number }[] = []
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = this.getCell(row, col)
        if (cell) {
          cellsInRange.push({ cell, row, col })
        }
      }
    }
    return cellsInRange
  }

  get rowCount() {
    return this.rowsHeight.length
  }
  get colCount() {
    return this.colsWidth.length
  }

  public offset(row: number, col: number): Cell | null {
    if (this.activeCell === null) return null
    const rowI = this.activeCell?.row + row
    const colI = this.activeCell?.col + col
    try {
      return this.cells[rowI][colI]
    } catch {
      return null
    }
  }
}

export class WorksheetPlugin extends BasePlugin {
  public name = 'worksheet-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 图形工具
    this.host.emit('graphic-tool:registered', {
      type: 'worksheet',
      render: () => Tool,
      source: 'worksheet-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册图形
    this.host.emit('graphic:registered', {
      type: 'worksheet',
      render: () => Shape,
      source: 'worksheet-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册属性面板
    this.host.emit('property-panel:registered', {
      graphicTypes: ['worksheet'],
      render: () => PropertyPanel,
      source: 'worksheet-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })
    // 注册元素构造器
    this.host.emit('element:registered', {
      type: 'worksheet',
      createElement: () => new WorksheetElement(),
      source: 'worksheet-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册上下文菜单
    this.host.emit('context-menu:registered', {
      graphicTypes: ['worksheet'],
      isCanvas: false,
      isPublic: false,
      render: () => ContextMenu,
      source: 'worksheet-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}
