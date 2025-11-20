import { BasePlugin } from '../types/base-plugin'
import type { StageKeyboardEventData } from '../types'
import { RemoveElementCommand } from '@/commands'
import type { SelectionPlugin } from './selection'

export class KeyDownPlugin extends BasePlugin {
  public name = 'keydown-plugin'
  public version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    // 监听画布键盘事件
    this.host.on('stage:keydown', this.handleKeyDown.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    this.host.off('stage:keydown', this.handleKeyDown.bind(this))
  }

  private handleKeyDown(event: StageKeyboardEventData): void {
    if (!this.host) return
    if (event.evt.code == 'Delete') {
      this.deleteSelectionElement()
    }
  }

  private deleteSelectionElement(): void {
    if (!this.host) return
    const selector = this.host.getPlugin('selection-plugin')
    // 删除选中的图形
    selector.getSelectionElements().forEach((i) => {
      if (this.host) {
        this.host.executeCommand(new RemoveElementCommand(this.host, i))
      }
    })
    // 清空选择
    selector.clearSelection()
  }

  // 左移
  private toLeft(): void {}
}

// 将 KeyDownPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'keydown-plugin': KeyDownPlugin
  }
}
