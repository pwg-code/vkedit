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
  public master?: { row: number; col: number }
  // 合并的范围
  public mergedCells?: MergedCellInfo

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

  // 获取合并单元格的主单元格
  public getMasterCell(): Cell | null {
    if (this.master) {
      return this.table.cells[this.master.row][this.master.col]
    }
    return null
  }

  // 获取合并的单元格
  public getMergedCells(): { cell: Cell; row: number; col: number }[] {
    if (!this.mergedCells) return []
    return this.table.getCellsInRange(
      this.mergedCells.masterRow,
      this.mergedCells.masterCol,
      this.mergedCells.masterRow + this.mergedCells.rowSpan - 1,
      this.mergedCells.masterCol + this.mergedCells.colSpan - 1,
    )
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
      master: this.master,
      mergedCells: this.mergedCells,
    }
  }
}
