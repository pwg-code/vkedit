import { BasePlugin } from '@/types/base-plugin'
import type { IGraphicElement } from '@/types'
import { AddElementCommand, BatchCommand } from '@/commands'
import { EventUtils } from '@/types/event-data'

export interface PointMM {
  x: number
  y: number
}

interface ClipboardState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshots: any[]
  origin: PointMM
}

export class ClipboardPlugin extends BasePlugin {
  public name = 'clipboard-plugin'
  public version = '1.0.0'

  private state: ClipboardState | null = null
  private fallbackOffset = 0
  private lastMousePointMM: PointMM | null = null
  private mouseOnCanvas = false

  private static readonly FALLBACK_STEP = 10
  private static readonly SELECT_DELAY = 300

  protected onInstall(): void {
    if (!this.host) return
    this.host.on('stage:mousemove', this.handleMouseMove)
    this.host.on('stage:mouseenter', this.handleMouseEnter)
    this.host.on('stage:mouseleave', this.handleMouseLeave)
  }

  protected onUninstall(): void {
    if (!this.host) return
    this.host.off('stage:mousemove', this.handleMouseMove)
    this.host.off('stage:mouseenter', this.handleMouseEnter)
    this.host.off('stage:mouseleave', this.handleMouseLeave)
  }

  private handleMouseMove = (_event: any): void => {
    const node = this.host?.contentGroup?.getNode?.()
    if (!node) return
    const rel = node.getRelativePointerPosition()
    if (!rel) return
    const dpm = this.host!.status.dpm || 8
    this.lastMousePointMM = { x: rel.x / dpm, y: rel.y / dpm }
    this.mouseOnCanvas = true
  }

  private handleMouseEnter = (): void => {
    this.mouseOnCanvas = true
  }

  private handleMouseLeave = (): void => {
    this.mouseOnCanvas = false
  }

  copy(elements: IGraphicElement[]): void {
    if (!this.host || !elements || elements.length === 0) return
    const snapshots = elements.map((e) => e.serialize())
    const origin: PointMM = {
      x: Math.min(...elements.map((e) => (e as any).xmm)),
      y: Math.min(...elements.map((e) => (e as any).ymm)),
    }
    this.state = { snapshots, origin }
    this.fallbackOffset = 0

    const base = EventUtils.createBaseEventData('clipboard-plugin')
    this.host.emit('clipboard:copy' as any, {
      ...base,
      elementIds: elements.map((e) => e.id),
    })
    elements.forEach((element) => {
      this.host!.emit('element:copied', {
        ...EventUtils.createBaseEventData('clipboard-plugin'),
        element,
        elementId: element.id,
      })
    })
  }

  paste(targetPointMM?: PointMM): string[] {
    if (!this.host || !this.state || this.state.snapshots.length === 0) return []

    let target: PointMM
    if (targetPointMM) {
      target = targetPointMM
      this.fallbackOffset = 0
    } else if (this.mouseOnCanvas && this.lastMousePointMM) {
      target = this.lastMousePointMM
      this.fallbackOffset = 0
    } else {
      this.fallbackOffset += ClipboardPlugin.FALLBACK_STEP
      target = {
        x: this.state.origin.x + this.fallbackOffset,
        y: this.state.origin.y + this.fallbackOffset,
      }
    }

    const delta: PointMM = {
      x: target.x - this.state.origin.x,
      y: target.y - this.state.origin.y,
    }

    const elementManager = this.host.getPlugin('element-manager-plugin')
    const newElements: IGraphicElement[] = []
    const newIds: string[] = []

    for (const snapshot of this.state.snapshots) {
      const el = elementManager.createElement(snapshot.type) as any
      el.deserialize(snapshot)
      el.id = crypto.randomUUID?.() ?? this.uuidFallback()
      el.xmm = snapshot.xmm + delta.x
      el.ymm = snapshot.ymm + delta.y
      newElements.push(el)
      newIds.push(el.id)
    }

    const commands = newElements.map((el) => new AddElementCommand(this.host!, el))
    const batch = new BatchCommand(this.host, commands, '粘贴元素')
    this.host.executeCommand(batch)

    const base = EventUtils.createBaseEventData('clipboard-plugin')
    this.host.emit('clipboard:paste' as any, { ...base, newElementIds: newIds })
    newElements.forEach((element) => {
      this.host!.emit('element:pasted', {
        ...EventUtils.createBaseEventData('clipboard-plugin'),
        element,
        elementId: element.id,
      })
    })

    this.selectAfterDelay(newIds)
    return newIds
  }

  cloneElementsAt(elements: IGraphicElement[], deltaMM: PointMM): string[] {
    if (!this.host || !elements || elements.length === 0) return []

    const newElements: IGraphicElement[] = []
    const newIds: string[] = []
    for (const src of elements) {
      const cloned = src.clone() as any
      cloned.xmm = (src as any).xmm + deltaMM.x
      cloned.ymm = (src as any).ymm + deltaMM.y
      newElements.push(cloned)
      newIds.push(cloned.id)
    }

    const commands = newElements.map((el) => new AddElementCommand(this.host!, el))
    const desc =
      newElements.length > 1 ? `Alt 克隆 ${newElements.length} 个元素` : 'Alt 克隆元素'
    const batch = new BatchCommand(this.host, commands, desc)
    this.host.executeCommand(batch)

    newElements.forEach((element) => {
      this.host!.emit('element:cloned', {
        ...EventUtils.createBaseEventData('clipboard-plugin'),
        element,
        elementId: element.id,
      })
    })

    this.selectAfterDelay(newIds)
    return newIds
  }

  clear(): void {
    this.state = null
    this.fallbackOffset = 0
    this.host?.emit('clipboard:clear', EventUtils.createBaseEventData('clipboard-plugin'))
  }

  hasData(): boolean {
    return this.state !== null && this.state.snapshots.length > 0
  }

  private selectAfterDelay(ids: string[]): void {
    if (ids.length === 0 || !this.host) return
    const selectionPlugin = this.host.getPlugin('selection-plugin')
    setTimeout(() => {
      selectionPlugin.clearSelection()
      selectionPlugin.selectElementByIds(ids)
      this.host!.emit('selection:changed', {
        ...EventUtils.createBaseEventData('clipboard-plugin'),
        selection: selectionPlugin.getSelectionElements(),
      })
    }, ClipboardPlugin.SELECT_DELAY)
  }

  private uuidFallback(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0
      const v = ch === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

declare module '@/types' {
  interface PluginMap {
    'clipboard-plugin': ClipboardPlugin
  }
}
