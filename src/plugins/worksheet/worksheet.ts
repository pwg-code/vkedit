import { BasePlugin } from '../../types/base-plugin'
import { type IGraphicElement, BaseGraphicType } from '../../types'
import Shape from './Shape.vue'
import PropertyPanel from './PropertyPanel.vue'
import Tool from './Tool.vue'
import { BaseGraphicElement } from '@/types/base-graphic-element'
import ContextMenu from './ContextMenu.vue'
import { Cell, type CellBorder, type MergedRegion } from './cell'

// 元素实现
export class WorksheetElement extends BaseGraphicElement {
  public type = 'worksheet'
  public activeCell: Cell | null = null // 直接引用 Cell 对象
  public mergedRegions: Map<string, MergedRegion> = new Map()
  // 缓存相关的私有属性
  private _cachedGeometry: {
    width: number
    height: number
  } | null = null
  // 缓存是否有效
  private _geometryValid: boolean = false

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
    // 初始化宽高
    this.setActiveCell(0, 0)
  }

  // 失效所有单元格几何缓存的方法
  private invalidateAllCellsGeometry(): void {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.invalidateGeometry()
      })
    })
  }

  // 计算所有单元格缓存
  private calculateAllCellsGeometry(): void {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.getGeometry()
      })
    })
  }

  // 失效缓存的方法
  public invalidateGeometry(): void {
    this._cachedGeometry = null
    this._geometryValid = false
    this.invalidateAllCellsGeometry()
  }

  // 计算几何(宽高)
  public calculateGeometry() {
    this._cachedGeometry = {
      width: this.colsWidth.reduce((acc, curr) => acc + curr, 0),
      height: this.rowsHeight.reduce((acc, curr) => acc + curr, 0),
    }
    this._geometryValid = true
    this.calculateAllCellsGeometry()
  }

  public get width(): number {
    if (!this._geometryValid) {
      this.calculateGeometry()
    }
    return this._cachedGeometry?.width || 0
  }

  public set width(value: number) {
    // 不允许直接设置宽度
  }

  public get height(): number {
    if (!this._geometryValid) {
      this.calculateGeometry()
    }
    return this._cachedGeometry?.height || 0
  }

  public set height(value: number) {
    // 不允许直接设置高度
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
    this.activeCell = this.cells[rowIndex]?.[colIndex] || null
  }

  // 获取默认的单元格配置
  public getDefaultCell(rowIndex: number, colIndex: number): Cell {
    return new Cell(this)
  }

  // 获取默认的行高
  public getDefaultRowHeight(): number {
    return 30
  }

  // 获取默认的列宽
  public getDefaultColWidth(): number {
    return 70
  }

  // 增加一行
  public addRow(
    afterIndex: number = -1,
    cells: Cell[] | null = null,
    rowHeight: number | null = null,
  ) {
    const insertIndex = afterIndex === -1 ? this.rowsHeight.length : afterIndex + 1
    // 1. 先更新合并区域
    this.updateMergedRegionsOnInsert(insertIndex, 'row')
    // 2. 插入行数据
    const newRow =
      cells || this.colsWidth.map((_, colIndex) => this.getDefaultCell(insertIndex, colIndex))
    this.cells.splice(insertIndex, 0, newRow)
    this.rowsHeight.splice(insertIndex, 0, rowHeight || this.getDefaultRowHeight())
    // 3. 更新插入行之后的合并区域中单元格的regionId
    this.reassignMergedRegionIds()
    this.invalidateGeometry()
    return newRow
  }

  private updateMergedRegionsOnInsert(insertIndex: number, type: 'row' | 'col'): void {
    this.mergedRegions.forEach((region, id) => {
      if (type === 'row') {
        // 如果插入位置在合并区域内部
        if (insertIndex > region.startRow && insertIndex <= region.endRow) {
          region.endRow += 1 // 扩展合并区域
        }
        // 如果插入位置在合并区域之前
        else if (insertIndex <= region.startRow) {
          region.startRow += 1
          region.endRow += 1
        }
      } else {
        // 如果插入位置在合并区域内部
        if (insertIndex > region.startCol && insertIndex <= region.endCol) {
          region.endCol += 1 // 扩展合并区域
        }
        // 如果插入位置在合并区域之前
        else if (insertIndex <= region.startCol) {
          region.startCol += 1
          region.endCol += 1
        }
      }
    })
  }
  private updateMergedRegionsOnRemove(removeIndex: number, type: 'row' | 'col'): void {
    this.mergedRegions.forEach((region, id) => {
      if (type === 'row') {
        // 如果删除的刚好是合并单元格的主单元格 则取消合并
        if (removeIndex === region.startRow) {
          this.removeMergedRegion(id)
          return
        }
        // 如果删除位置在合并区域内部
        if (removeIndex > region.startRow && removeIndex <= region.endRow) {
          region.endRow -= 1 // 减少合并区域
        }
        // 如果删除位置在合并区域之前
        else if (removeIndex < region.startRow) {
          region.startRow -= 1
          region.endRow -= 1
        }
      } else {
        // 如果删除的刚好是合并单元格的主单元格 则取消合并
        if (removeIndex === region.startCol) {
          this.removeMergedRegion(id)
          return
        }
        // 如果删除位置在合并区域内部
        if (removeIndex > region.startCol && removeIndex <= region.endCol) {
          region.endCol -= 1 // 减少合并区域
        }
        // 如果删除位置在合并区域之前
        else if (removeIndex < region.startCol) {
          region.startCol -= 1
          region.endCol -= 1
        }
      }
    })
  }
  public removeRow(index: number): {
    removedCells: Cell[]
    removedRowHeight: number
    removeIndex: number
  } {
    // 1. 处理涉及的合并区域
    this.updateMergedRegionsOnRemove(index, 'row')
    // 2. 删除行数据
    const removedCells = this.cells.splice(index, 1)[0]
    const removedRowHeight = this.rowsHeight.splice(index, 1)[0]

    // 3. 重新分配合并区域ID
    this.reassignMergedRegionIds()
    this.invalidateGeometry()
    return { removedCells, removedRowHeight, removeIndex: index }
  }

  // 增加一列
  public addCol(after: number = -1, cells: Cell[] | null = null, colWidth: number | null = null) {
    const insertIndex = after == -1 ? this.colsWidth.length : after + 1
    let newColWidth = colWidth || this.getDefaultColWidth()
    const newCol =
      cells || this.rowsHeight.map((_, rowIndex) => this.getDefaultCell(rowIndex, insertIndex))
    // 1. 先更新合并区域
    this.updateMergedRegionsOnInsert(insertIndex, 'col')
    // 2. 插入行数据
    this.cells.forEach((row, rowIndex) => {
      row.splice(insertIndex, 0, newCol[rowIndex])
    })
    this.colsWidth.splice(insertIndex, 0, newColWidth)
    // 3. 更新插入列之后的合并区域中单元格的regionId
    this.reassignMergedRegionIds()

    this.invalidateGeometry()
    return newCol
  }

  // 删除一列 返回被删除的列数据
  public removeCol(index: number): {
    removedCells: Cell[]
    removedColWidth: number
    removeIndex: number
  } {
    // 1. 处理涉及的合并区域
    this.updateMergedRegionsOnRemove(index, 'col')
    // 2. 删除列数据
    const removedCells: Cell[] = []
    const removedColWidth = this.colsWidth[index]
    this.cells.forEach((row) => {
      removedCells.push(row.splice(index, 1)[0])
    })
    this.colsWidth.splice(index, 1)

    // 3. 重新分配合并区域ID
    this.reassignMergedRegionIds()
    this.invalidateGeometry()
    return { removedCells, removedColWidth, removeIndex: index }
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
  }

  serialize() {
    return {
      ...super.serialize(),
      rowsHeight: this.rowsHeight,
      colsWidth: this.colsWidth,
      cells: this.cells.map((row) => row.map((c) => c.serialize())),
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
  getCellsInRange(startRow: number, startCol: number, endRow: number, endCol: number): Cell[] {
    const cellsInRange: Cell[] = []
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = this.getCell(row, col)
        if (cell) {
          cellsInRange.push(cell)
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

  // 获取受影响的合并区域ID列表
  public getAffectedMergedRegionIds(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ): string[] {
    const affectedRegionIds: Set<string> = new Set()
    this.mergedRegions.forEach((region, id) => {
      if (
        !(
          endRow < region.startRow ||
          startRow > region.endRow ||
          endCol < region.startCol ||
          startCol > region.endCol
        )
      ) {
        affectedRegionIds.add(id)
      }
    })
    return Array.from(affectedRegionIds)
  }

  // 创建合并区域
  public createMergedRegion(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ): string {
    const id = `merged_${Date.now()}_${Math.random()}`
    const region: MergedRegion = { id, startRow, startCol, endRow, endCol }

    // 检查冲突
    if (this.hasConflictingMergedRegion(startRow, startCol, endRow, endCol)) {
      // 取消冲突的合并区域
      const conflictingIds = this.getAffectedMergedRegionIds(startRow, startCol, endRow, endCol)
      conflictingIds.forEach((conflictId) => {
        this.removeMergedRegion(conflictId)
      })
    }

    // 设置单元格的合并区域ID
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this.cells[r][c].mergedRegionId = id
      }
    }

    this.mergedRegions.set(id, region)
    this.invalidateGeometry()
    return id
  }

  // 删除合并区域
  public removeMergedRegion(regionId: string): void {
    const region = this.mergedRegions.get(regionId)
    if (!region) return

    // 清除单元格的合并区域ID
    for (let r = region.startRow; r <= region.endRow; r++) {
      for (let c = region.startCol; c <= region.endCol; c++) {
        if (this.cells[r]?.[c]) {
          this.cells[r][c].mergedRegionId = undefined
        }
      }
    }

    this.mergedRegions.delete(regionId)
    this.invalidateGeometry()
  }

  // 检查是否有冲突的合并区域
  private hasConflictingMergedRegion(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ): boolean {
    return Array.from(this.mergedRegions.values()).some((region) => {
      return !(
        endRow < region.startRow ||
        startRow > region.endRow ||
        endCol < region.startCol ||
        startCol > region.endCol
      )
    })
  }

  // 重新分配合并区域ID（在结构变化后调用）
  private reassignMergedRegionIds(): void {
    // 先清除所有单元格的mergedRegionId
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.mergedRegionId = undefined
      })
    })

    // 重新分配
    this.mergedRegions.forEach((region, id) => {
      for (let r = region.startRow; r <= region.endRow; r++) {
        for (let c = region.startCol; c <= region.endCol; c++) {
          if (this.cells[r]?.[c]) {
            this.cells[r][c].mergedRegionId = id
          }
        }
      }
    })
  }

  // 获取单元格的有效值（考虑合并）
  public getCellEffectiveValue(row: number, col: number): string {
    const cell = this.getCell(row, col)
    if (!cell || !cell.mergedRegionId) {
      return cell?.value || ''
    }

    const region = this.mergedRegions.get(cell.mergedRegionId)
    if (!region) return cell.value || ''

    // 返回合并区域的值，或者主单元格的值
    return region.value || this.cells[region.startRow][region.startCol].value || ''
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
