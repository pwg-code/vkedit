// src/plugins/snap/snap.ts
import { ref, type Ref } from 'vue'
import { BasePlugin } from '@/types/base-plugin'
import type { IGraphicElement, ViewEventData, ElementDragEventData } from '@/types'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import type { SelectionPlugin } from '@/plugins'
import {
  getElementAABB,
  getAABBLineValues,
  unionAABB,
  computeSnap,
  type AABB,
  type AABBLineValues,
  type GuideLine,
} from '@/utils/geometry'
import SnapToggle from './SnapToggle.vue'

const SNAP_THRESHOLD_PX = 5

export class SnapPlugin extends BasePlugin {
  public name = 'snap-plugin'
  public version = '1.0.0'

  public guideLines: Ref<GuideLine[]> = ref([])

  private snapEnabledSnapshot = false
  private cachedTargetLines: AABBLineValues[] = []
  private cachedSelectionIds: Set<string> = new Set()

  protected onInstall(): void {
    if (!this.host) return
    this.host.on('element:dragstart', this.handleDragStart.bind(this))
    this.host.on('element:dragmove', this.handleDragMove.bind(this))
    this.host.on('element:dragend', this.handleDragEnd.bind(this))

    this.host.emit('tool:registered', {
      toolName: 'snap-toggle',
      render: () => SnapToggle,
      group: 'actions',
      source: 'snap-plugin-on-install',
      timestamp: Date.now(),
    })
  }

  protected onUninstall(): void {
    if (!this.host) return
    ;(this.host.off as any)('element:dragstart')
    ;(this.host.off as any)('element:dragmove')
    ;(this.host.off as any)('element:dragend')
    this.guideLines.value = []
  }

  public isSnapEnabled(): boolean {
    return !!this.host?.status.snapToGrid
  }

  public toggleSnap(): void {
    if (!this.host) return
    this.host.status.snapToGrid = !this.host.status.snapToGrid
    this.host.emit('view:snap-change', {
      zoom: this.host.status.zoom,
      source: 'snap-plugin-toggle',
      timestamp: Date.now(),
    } as ViewEventData)
  }

  private handleDragStart(): void {
    if (!this.host) return
    this.snapEnabledSnapshot = !!this.host.status.snapToGrid
    if (!this.snapEnabledSnapshot) {
      this.cachedTargetLines = []
      this.cachedSelectionIds = new Set()
      return
    }
    this.cacheTargets()
  }

  private cacheTargets(): void {
    if (!this.host) return
    const elementsPlugin = this.host.getPlugin('graphic-registry-plugin') as GraphicRegistryPlugin
    const selectionPlugin = this.host.getPlugin('selection-plugin') as SelectionPlugin
    const selection = selectionPlugin?.getSelectionElements() ?? []
    this.cachedSelectionIds = new Set(selection.map((e) => e.id))

    this.cachedTargetLines = []
    elementsPlugin?.elements.forEach((el) => {
      if (!el.visible) return
      if (this.cachedSelectionIds.has(el.id)) return
      const aabb = getElementAABB({
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        scaleX: el.scaleX,
        scaleY: el.scaleY,
      })
      this.cachedTargetLines.push(getAABBLineValues(aabb))
    })
  }

  private handleDragMove(payload: ElementDragEventData): void {
    if (!this.host || !this.snapEnabledSnapshot) return
    if (this.cachedTargetLines.length === 0) return

    const selectionPlugin = this.host.getPlugin('selection-plugin') as SelectionPlugin
    const selection = selectionPlugin?.getSelectionElements() ?? []
    const draggedEls: IGraphicElement[] =
      selection.length > 0 && selection.some((e) => e.id === payload.element.id)
        ? selection
        : [payload.element]

    const aabbs: AABB[] = []
    for (const e of draggedEls) {
      const node = this.host.contentLayer?.getNode?.().findOne('#' + e.id)
      if (!node) continue
      aabbs.push(
        getElementAABB({
          x: node.x(),
          y: node.y(),
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          scaleX: e.scaleX,
          scaleY: e.scaleY,
        }),
      )
    }
    const overall = unionAABB(aabbs)
    if (!overall) return

    const threshold = SNAP_THRESHOLD_PX / this.host.status.zoom
    const result = computeSnap(getAABBLineValues(overall), this.cachedTargetLines, threshold)

    const lines: GuideLine[] = []

    if (result.x) {
      const offsetX = result.x.snapTo - result.x.source
      if (offsetX !== 0) {
        for (const e of draggedEls) {
          const node = this.host.contentLayer?.getNode?.().findOne('#' + e.id)
          if (node) node.x(node.x() + offsetX)
        }
      }
      lines.push({ axis: 'x', value: result.x.snapTo })
    }
    if (result.y) {
      const offsetY = result.y.snapTo - result.y.source
      if (offsetY !== 0) {
        for (const e of draggedEls) {
          const node = this.host.contentLayer?.getNode?.().findOne('#' + e.id)
          if (node) node.y(node.y() + offsetY)
        }
      }
      lines.push({ axis: 'y', value: result.y.snapTo })
    }

    this.guideLines.value = lines
  }

  private handleDragEnd(): void {
    this.guideLines.value = []
    this.cachedTargetLines = []
    this.cachedSelectionIds = new Set()
  }
}

declare module '@/types' {
  interface PluginMap {
    'snap-plugin': SnapPlugin
  }
}
