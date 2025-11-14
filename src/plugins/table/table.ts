import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import ContextMenu from './ContextMenu.vue'

export interface CellConfig {
  x: number
  y: number
  width: number
  height: number
  fill: string
  text: string
  borderUp: boolean
  borderLeft: boolean
  mergeUp: boolean
  mergeLeft: boolean
  fontSize: number
  align: 'left' | 'center' | 'right' | 'justify'
  verticalAlign: 'top' | 'middle' | 'bottom'
  fontStyle?: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' // 文字加粗
  visible: boolean
}

// 元素实现
export class TableElement extends BaseGraphicElement {
  public type = 'table'
  public activeCell: CellConfig
  public activeRow: number = 0
  public activeCol: number = 0
  constructor(
    x: number = 50,
    y: number = 50,
    public rowsHeight: number[] = [48, 48, 48, 48], // 行高
    public colsWidth: number[] = [168, 168, 168, 168, 168, 168], // 列宽
    public cells: CellConfig[][] = [], // 单元格配置
  ) {
    super(x, y)
    // 如果没有提供单元格数据则 初始化单元格
    if (cells.length === 0) this.initCells()
    this.activeCell = this.cells[0][0]
    // 计算隐藏的单元格
    this.updateCells()
  }

  public initWidthHeight() {
    this.width = this.colsWidth.reduce((acc, curr) => acc + curr, 0)
    this.height = this.rowsHeight.reduce((acc, curr) => acc + curr, 0)
  }

  // 初始化单元格
  public initCells() {
    this.cells = this.rowsHeight.map((rowHeight, rowIndex) => {
      return this.colsWidth.map((colWidth, colIndex) => {
        return this.getDefaultCellConfig(rowIndex, colIndex)
      })
    })
  }

  // 某些属性变更需要调用触发更新单元格 增加行
  public updateCells() {
    this.cells.forEach((row, i) => {
      row.forEach((c, j) => {
        const { width, height } = this.getCellSize(i, j)
        c.width = width
        c.height = height
        c.x = this.getCellX(j)
        c.y = this.getCellY(i)
        c.visible = !c.mergeLeft && !c.mergeUp
      })
    })
    // 自动计算宽高
    this.initWidthHeight()
  }

  // 计算x的位置
  public getCellX(col: number) {
    let x = 0
    for (var i = 0; i < col; i++) {
      x = x + this.colsWidth[i]
    }
    return x
  }

  // 计算y的位置
  public getCellY(row: number) {
    let y = 0
    for (var i = 0; i < row; i++) {
      y = y + this.rowsHeight[i]
    }
    return y
  }

  // 计算单元格的宽度
  public getCellSize = (rowIndex: number, colIndex: number) => {
    let width = this.colsWidth[colIndex]
    let height = this.rowsHeight[rowIndex]
    let cell = this.cells[rowIndex][colIndex]
    // 如果右侧单元格是合并左 则加上其宽度
    let i = colIndex + 1
    while (i < this.colCount && this.cells[rowIndex][i].mergeLeft) {
      width += this.colsWidth[i]
      i++
    }
    // 如果下方单元格是合并上 则加上其高度
    i = rowIndex + 1
    while (i < this.rowCount && this.cells[i][colIndex].mergeUp) {
      height += this.rowsHeight[i]
      i++
    }
    return { width, height }
  }

  // 更新活动单元格
  public setActiveCell(rowIndex: number, colIndex: number) {
    this.activeCell = this.cells[rowIndex][colIndex]
    this.activeRow = rowIndex
    this.activeCol = colIndex
  }

  // 获取默认的单元格配置
  public getDefaultCellConfig(rowIndex: number, colIndex: number): CellConfig {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fill: '',
      text: '',
      borderUp: true,
      borderLeft: true,
      mergeUp: false,
      mergeLeft: false,
      fontSize: 14,
      align: 'center',
      verticalAlign: 'middle',
      fontStyle: 'normal',
      visible: true,
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
        48,
        ...this.rowsHeight.slice(after + 1),
      ]
    }
    this.updateCells()
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
    this.updateCells()
    // 如果删除的活动单元格的行  则设置下一个单元格为活动单元格
    const rowIndex = Math.min(this.activeRow, this.rowCount - 1)
    const colIndex = Math.min(this.activeCol, this.colCount - 1)
    this.setActiveCell(rowIndex, colIndex)
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
        168,
        ...this.colsWidth.slice(after + 1),
      ]
    }
    this.updateCells()
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
    this.updateCells()
    // 如果删除的活动单元格的列  则设置下一个单元格为活动单元格
    const rowIndex = Math.min(this.activeRow, this.rowCount - 1)
    const colIndex = Math.min(this.activeCol, this.colCount - 1)
    this.setActiveCell(rowIndex, colIndex)
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

  get rowCount() {
    return this.rowsHeight.length
  }
  get colCount() {
    return this.colsWidth.length
  }

  public offset(row: number, col: number): CellConfig | undefined {
    const rowI = this.activeRow + row
    const colI = this.activeCol + col
    try {
      return this.cells[rowI][colI]
    } catch {
      return undefined
    }
  }
}

export class TablePlugin extends BasePlugin {
  public name = 'table-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 图形工具
    this.host.emit('graphic-tool:registered', {
      type: 'table',
      render: () => Tool,
      source: 'table-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册图形
    this.host.emit('graphic:registered', {
      type: 'table',
      render: () => Shape,
      source: 'table-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册属性面板
    this.host.emit('property-panel:registered', {
      graphicTypes: ['table'],
      render: () => PropertyPanel,
      source: 'table-plugin-on-install',
      timestamp: Date.now(),
      isCanvas: false,
      isPublic: false,
    })
    // 注册元素构造器
    this.host.emit('element:registered', {
      type: 'table',
      createElement: () => new TableElement(),
      source: 'table-plugin-on-install',
      timestamp: Date.now(),
    })
    // 注册上下文菜单
    this.host.emit('context-menu:registered', {
      graphicTypes: ['table'],
      isCanvas: false,
      isPublic: false,
      render: () => ContextMenu,
      source: 'table-plugin-on-install',
      timestamp: Date.now(),
    })
  }
}
