/*
单元格
*/

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
  // 省略gradient相关属性
}

// export interface CellConfig {
//   x: number
//   y: number
//   width: number
//   height: number
//   fill: string
//   text: string
//   borderUp: boolean
//   borderLeft: boolean
//   mergeUp: boolean
//   mergeLeft: boolean
//   fontSize: number
//   align: 'left' | 'center' | 'right' | 'justify'
//   verticalAlign: 'top' | 'middle' | 'bottom'
//   fontStyle?: 'normal' | 'italic' | 'bold' | '500' | 'italic bold' // 文字加粗
//   visible: boolean
// }

export class Cell {
  public value: string
  public font: CellFont
  public alignment: CellAlignment
  public border: CellBorder
  public fill: CellFill
  public visible: boolean
  // 合并单元格的主单元格引用
  public master?: Cell
  // 合并的范围
  public mergeRange?: { startRow: number; endRow: number; startCol: number; endCol: number }

  constructor() {
    this.value = ''
    this.font = {}
    this.alignment = {}
    this.border = {}
    this.fill = {}
    this.visible = true
  }
}
