import { BasePlugin } from '../../types/BasePlugin'
import type { IGraphicType, IGraphicElement, IPropertyPanel } from '../../types'
import TableGraphic from './TableGraphic.vue'
import TablePropertyPanel from './TablePropertyPanel.vue'
import { BaseGraphicElement } from '@/types/BaseGraphicElement'

export interface CellConfig {
  rowIndex: number
  colIndex: number
  fill: string
  text: string
  isMergeLeft: boolean // 合并左
  isMergeUp: boolean // 合并上
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
    public id: string,
    public x: number,
    public y: number,
    public width: number = 300,
    public height: number = 80,
    public rowsHeight: number[] = [40, 40], // 行高
    public colsWidth: number[] = [100, 100, 100], // 列宽
    public cells: CellConfig[][] = [], // 单元格配置
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1,
    public visible: boolean = true,
    public locked: boolean = false,
    public draggable: boolean = true,
  ) {
    super()
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
      text: '文本',
      isMergeLeft: false,
      isMergeUp: false,
      fontSize: 14,
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
    return new TableElement(
      `table-${Date.now()}`,
      this.x,
      this.y,
      this.width,
      this.height,
      this.rowsHeight,
      this.colsWidth,
      this.cells,
      this.rotation,
      this.scaleX,
      this.scaleY,
      this.visible,
      this.locked,
    )
  }

  serialize() {
    return {
      type: this.type,
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rowsHeight: this.rowsHeight,
      colsWidth: this.colsWidth,
      cells: this.cells,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      locked: this.locked,
    }
  }

  deserialize(data: any): void {
    Object.assign(this, data)
  }
}

export class TablePlugin extends BasePlugin {
  public name = 'table-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册表格图形类型
    this.host.emit('graphic-type:registered', this.getGraphicType())
    // 注册属性面板
    this.host.emit('property-panel:registered', this.getPropertyPanel())
  }
  private getPropertyPanel(): IPropertyPanel {
    return {
      type: 'table',
      title: '表格属性',
      getComponent: () => TablePropertyPanel,
    }
  }

  private getGraphicType(): IGraphicType {
    return {
      type: 'table',
      name: '表格',
      icon: '',
      getComponent() {
        return TableGraphic
      },
      createElement: (x: number, y: number) => {
        return new TableElement(`table-${Date.now()}`, x, y)
      },
    }
  }
}
