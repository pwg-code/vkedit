/*
单元格
*/

import type { IAlign, IFontStyle, IVerticalAlign } from '@/types'
import type { WorksheetElement } from './worksheet'

// 字体配置 依据exceljs的font定义 具体见 https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%AD%97%E4%BD%93
export interface CellFont {
  name?: string
  family?: string
  scheme?: 'minor' | 'major' | 'none'
  charset?: number
  size?: number
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean | 'none' | 'single' | 'double' | 'singleAccounting' | 'doubleAccounting'
  strikeout?: boolean
  strike?: 'none' | 'single' | 'double'
  outline?: boolean
  vertAlign?: 'superscript' | 'subscript'
}

// 单元格对齐属性 依据exceljs的Alignment定义 具体见https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%AF%B9%E9%BD%90
export interface CellAlignment {
  vertical?: 'top' | 'middle' | 'bottom' | 'distributed' | 'justify'
  horizontal?: 'left' | 'center' | 'right' | 'justify' | 'fill' | 'centerContinuous' | 'distributed'
  wrapText?: boolean
  indent?: number
  textRotation?: number | 'vertical'
  readingOrder?: 'rtl' | 'ltr'
}

// 边框项定义
export interface BorderItem {
  style:
    | 'thin'
    | 'dotted'
    | 'dashDot'
    | 'dashDotDot'
    | 'dashed'
    | 'double'
    | 'hair'
    | 'medium'
    | 'mediumDashDot'
    | 'mediumDashDotDot'
    | 'mediumDashed'
    | 'slantDashDot'
    | 'thick'
  color?: { argb: string }
}

// 单元格边框定义 依据exceljs的Border定义 具体见https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E8%BE%B9%E6%A1%86
export interface CellBorder {
  left?: BorderItem
  right?: BorderItem
  top?: BorderItem
  bottom?: BorderItem
}

// 单元格填充定义 依据exceljs的Fill定义 具体见https://github.com/exceljs/exceljs/blob/master/README_zh.md#%E5%A1%AB%E5%85%85
// 这里只定义了pattern类型
export interface CellFill {
  type?: 'pattern'
  pattern?:
    | 'none'
    | 'solid'
    | 'darkVertical'
    | 'darkHorizontal'
    | 'darkDown'
    | 'darkUp'
    | 'darkGrid'
    | 'darkTrellis'
    | 'lightVertical'
    | 'lightHorizontal'
    | 'lightDown'
    | 'lightUp'
    | 'lightGrid'
    | 'lightTrellis'
    | 'gray125'
    | 'gray0625'
  fgColor?: { argb: string }
  bgColor?: { argb: string }
}

export interface MergedCellInfo {
  masterRow: number
  masterCol: number
  rowSpan: number
  colSpan: number
}

export class Cell {
  public value: string
  public font: CellFont
  public alignment: CellAlignment
  public border: CellBorder
  public fill: CellFill
  public visible: boolean
  // 合并单元格的主单元格引用
  public masterInfo?: { row: number; col: number }
  // 合并的范围
  public mergedCells?: MergedCellInfo

  // 缓存相关的私有属性
  private _cachedGeometry: {
    x: number
    y: number
    width: number
    height: number
    row: number
    col: number
  } | null = null
  private _geometryValid: boolean = false

  constructor(public table: WorksheetElement) {
    this.value = ''
    this.font = {}
    this.alignment = {}
    this.border = {
      left: { style: 'thin' },
      top: { style: 'thin' },
    }
    this.fill = {}
    this.visible = true
  }

  // 使几何缓存失效的方法
  public invalidateGeometry(): void {
    this._geometryValid = false
    this._cachedGeometry = null
  }

  // 计算当前单元格的几何信息
  private calculateGeometry(): {
    x: number
    y: number
    width: number
    height: number
    row: number
    col: number
  } | null {
    // 在 worksheet 的 cells 数组中找到当前 cell 的位置
    for (let row = 0; row < this.table.cells.length; row++) {
      for (let col = 0; col < this.table.cells[row].length; col++) {
        if (this.table.cells[row][col] === this) {
          // 计算位置
          const x = this.table.colsWidth.slice(0, col).reduce((sum, width) => sum + width, 0)
          const y = this.table.rowsHeight.slice(0, row).reduce((sum, height) => sum + height, 0)

          // 计算尺寸（考虑合并单元格）
          let width = this.table.colsWidth[col]
          let height = this.table.rowsHeight[row]

          if (this.mergedCells) {
            const { masterRow, masterCol, rowSpan, colSpan } = this.mergedCells
            width = this.table.colsWidth
              .slice(masterCol, masterCol + colSpan)
              .reduce((sum, w) => sum + w, 0)
            height = this.table.rowsHeight
              .slice(masterRow, masterRow + rowSpan)
              .reduce((sum, h) => sum + h, 0)
          }

          return { x, y, width, height, row, col }
        }
      }
    }
    return null
  }

  // 获取缓存的几何信息，如果缓存失效则重新计算
  private getCachedGeometry(): {
    x: number
    y: number
    width: number
    height: number
    row: number
    col: number
  } | null {
    if (!this._geometryValid || !this._cachedGeometry) {
      this._cachedGeometry = this.calculateGeometry()
      this._geometryValid = true
    }
    return this._cachedGeometry
  }

  // 只读属性的 getter
  public get x(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.x ?? 0
  }

  public get y(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.y ?? 0
  }

  public get width(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.width ?? 0
  }

  public get height(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.height ?? 0
  }

  public get row(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.row ?? -1
  }

  public get col(): number {
    const geometry = this.getCachedGeometry()
    return geometry?.col ?? -1
  }

  // 获取几何信息
  public getGeometry(): {
    x: number
    y: number
    width: number
    height: number
    row: number
    col: number
  } | null {
    return this.getCachedGeometry()
  }

  // 获取合并的单元格
  public getMergedCells(): Cell[] {
    if (!this.mergedCells) return []
    return this.table.getCellsInRange(
      this.mergedCells.masterRow,
      this.mergedCells.masterCol,
      this.mergedCells.masterRow + this.mergedCells.rowSpan - 1,
      this.mergedCells.masterCol + this.mergedCells.colSpan - 1,
    )
  }

  // 获取主单元格
  public getMaster(): { cell: Cell; row: number; col: number } {
    if (this.masterInfo) {
      const cell = this.table.cells[this.masterInfo.row][this.masterInfo.col]
      return { cell, row: this.masterInfo.row, col: this.masterInfo.col }
    }
    return { cell: this, row: this.row, col: this.col }
  }

  // set cell text
  public set text(text: string) {
    this.value = text
  }
  public get text(): string {
    return this.value
  }

  // set font size
  public set fontSize(size: number) {
    // 这里转换为工作簿的字体大小
    this.font.size = size / 6
  }
  public get fontSize(): number {
    if (!this.font.size) return 12
    return this.font.size * 6
  }

  // set horizontal alignment
  public set align(align: IAlign) {
    this.alignment.horizontal = align
  }
  public get align(): IAlign {
    return (this.alignment.horizontal || 'center') as IAlign
  }
  //  set font style
  public set fontStyle(style: IFontStyle) {
    this.font.italic = style.includes('italic') ? true : false
    this.font.bold = style.includes('bold') ? true : false
  }
  public get fontStyle(): IFontStyle {
    if (this.font.italic && this.font.bold) {
      return 'italic bold'
    }
    if (this.font.bold) {
      return 'bold'
    }
    if (this.font.italic) {
      return 'italic'
    }
    return 'normal'
  }
  // set vertical alignment
  public set verticalAlign(align: IVerticalAlign) {
    this.alignment.vertical = align
  }
  public get verticalAlign(): IVerticalAlign {
    return (this.alignment.vertical || 'middle') as IVerticalAlign
  }

  // 反序列化
  public deserialize(data: any): void {
    Object.assign(this, data)
    this.invalidateGeometry() // 反序列化后失效缓存
  }

  // 序列化
  public serialize() {
    return {
      value: this.value,
      font: this.font,
      alignment: this.alignment,
      border: this.border,
      fill: this.fill,
      visible: this.visible,
      masterInfo: this.masterInfo,
      mergedCells: this.mergedCells,
    }
  }
}
