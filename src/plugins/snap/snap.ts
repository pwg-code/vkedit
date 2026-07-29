// src/plugins/snap/snap.ts
import { ref, type Ref } from 'vue'
import { BasePlugin } from '@/types/base-plugin'
import type { IGraphicElement, ViewEventData } from '@/types'
import type { GraphicRegistryPlugin } from '@/plugins/graphic-registry'
import type { SelectionPlugin } from '@/plugins'
import {
  getElementAABB,
  getAABBLineValues,
  unionAABB,
  computeSnap,
  applyStickySnap,
  snapResultToOffset,
  type AABB,
  type AABBLineValues,
  type GuideLine,
  type StickyState,
} from '@/utils/geometry'
const SNAP_THRESHOLD_PX = 5

export class SnapPlugin extends BasePlugin {
  public name = 'snap-plugin'
  public version = '1.0.0'

  public guideLines: Ref<GuideLine[]> = ref([])

  private snapEnabledSnapshot = false
  private cachedTargetLines: AABBLineValues[] = []
  private cachedSelectionIds: Set<string> = new Set()
  private sticky: StickyState = { x: null, y: null }

  protected onInstall(): void {
    if (!this.host) return
    this.host.on('element:dragstart', this.handleDragStart.bind(this))
    this.host.on('element:dragend', this.handleDragEnd.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    ;(this.host.off as any)('element:dragstart')
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

  private resetSessionState(): void {
    this.guideLines.value = []
    this.cachedTargetLines = []
    this.cachedSelectionIds = new Set()
    this.sticky = { x: null, y: null }
  }

  private handleDragStart(): void {
    if (!this.host) return
    this.snapEnabledSnapshot = !!this.host.status.snapToGrid
    if (!this.snapEnabledSnapshot) {
      this.resetSessionState()
      return
    }
    this.guideLines.value = []
    this.sticky = { x: null, y: null }
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

  public resolveDragSnap(
    elements: IGraphicElement[],
    intentPositions: Map<string, { x: number; y: number }>,
  ): { offsetX: number; offsetY: number } {
    const zero = { offsetX: 0, offsetY: 0 }
    if (!this.host || !this.snapEnabledSnapshot) {
      this.guideLines.value = []
      return zero
    }
    if (this.cachedTargetLines.length === 0 || elements.length === 0) {
      this.guideLines.value = []
      return zero
    }

    const aabbs: AABB[] = []
    for (const e of elements) {
      const pos = intentPositions.get(e.id)
      if (!pos) continue
      aabbs.push(
        getElementAABB({
          x: pos.x,
          y: pos.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          scaleX: e.scaleX,
          scaleY: e.scaleY,
        }),
      )
    }
    const overall = unionAABB(aabbs)
    if (!overall) {
      this.guideLines.value = []
      return zero
    }

    const intentLines = getAABBLineValues(overall)
    const threshold = SNAP_THRESHOLD_PX / this.host.status.zoom
    const raw = computeSnap(intentLines, this.cachedTargetLines, threshold)
    const { result, nextSticky } = applyStickySnap(intentLines, raw, this.sticky, threshold)
    this.sticky = nextSticky

    const lines: GuideLine[] = []
    if (result.x) lines.push({ axis: 'x', value: result.x.snapTo })
    if (result.y) lines.push({ axis: 'y', value: result.y.snapTo })
    this.guideLines.value = lines

    return snapResultToOffset(result)
  }

  private handleDragEnd(): void {
    this.resetSessionState()
  }
}

declare module '@/types' {
  interface PluginMap {
    'snap-plugin': SnapPlugin
  }
}
