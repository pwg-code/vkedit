import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D } from '../types'
import { RemoveElementCommand } from '@/commands'
import type { SelectionPlugin } from './selection-plugin'

export class KeyDownPlugin extends BasePlugin {
  public name = 'keydown'
  public version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    // 监听画布键盘事件
    this.host.on(EditorEvents.CANVAS_KEYDOWN, this.handleKeyDown.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    this.host.off(EditorEvents.CANVAS_KEYDOWN, this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: any): void {
    if (!this.host) return
    if (event.code == 'Delete') {
      this.deleteSelectionElement()
    }
  }

  private deleteSelectionElement(): void {
    if (!this.host) return
    const selector: SelectionPlugin = this.host.getPlugin('selection') as SelectionPlugin
    selector.selectionElements
    // 删除选中的图形
    selector.selectionElements.forEach((i) => {
      if (this.host) {
        this.host.executeCommand(new RemoveElementCommand(i, this.host))
      }
    })
  }

  // 左移
  private toLeft(): void {}
}
