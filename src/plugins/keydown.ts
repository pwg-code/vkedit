import { BasePlugin } from '../types/base-plugin'
import type { StageKeyboardEventData } from '../types'
import { BatchCommand, RemoveElementCommand, TransformElementCommand } from '@/commands'

export class KeyDownPlugin extends BasePlugin {
  public name = 'keydown-plugin'
  public version = '1.0.0'

  // 方向键移动步长（元素本地坐标，px）
  private static readonly MOVE_STEP = 1
  private static readonly MOVE_STEP_FAST = 10

  protected onInstall(): void {
    if (!this.host) return
    // 监听画布键盘事件
    this.host.on('stage:keydown', this.handleKeyDown.bind(this))
    // 方向键移动选中元素
    this.host.on('stage:keydown-left', this.handleMoveLeft.bind(this))
    this.host.on('stage:keydown-right', this.handleMoveRight.bind(this))
    this.host.on('stage:keydown-up', this.handleMoveUp.bind(this))
    this.host.on('stage:keydown-down', this.handleMoveDown.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return
    // 移除事件监听
    this.host.off('stage:keydown', this.handleKeyDown.bind(this))
    this.host.off('stage:keydown-left', this.handleMoveLeft.bind(this))
    this.host.off('stage:keydown-right', this.handleMoveRight.bind(this))
    this.host.off('stage:keydown-up', this.handleMoveUp.bind(this))
    this.host.off('stage:keydown-down', this.handleMoveDown.bind(this))
  }

  private handleKeyDown(event: StageKeyboardEventData): void {
    if (!this.host) return

    const evt = event.evt

    // 复制 Ctrl/Cmd + C
    if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyC') {
      if (this.isInputFocused()) return
      evt.preventDefault()
      this.copySelection()
      return
    }

    // 粘贴 Ctrl/Cmd + V
    if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyV') {
      if (this.isInputFocused()) return
      evt.preventDefault()
      this.pasteFromClipboard()
      return
    }

    if (evt.ctrlKey && evt.code === 'KeyZ') {
      evt.preventDefault()
      this.host.undo()
      return
    }

    if (evt.ctrlKey && evt.code === 'KeyY') {
      evt.preventDefault()
      this.host.redo()
      return
    }

    if (evt.code === 'Delete') {
      this.deleteSelectionElement()
      return
    }

    // F5: Esc 清空选择（输入框聚焦时不响应）
    if (evt.code === 'Escape') {
      if (this.isInputFocused()) return
      const selector = this.host.getPlugin('selection-plugin')
      if (selector.getSelectionElements().length > 0) {
        selector.clearSelection()
      }
      return
    }
  }

  // 左移
  private handleMoveLeft(event: StageKeyboardEventData): void {
    this.moveSelection(-this.getStep(event), 0)
  }

  // 右移
  private handleMoveRight(event: StageKeyboardEventData): void {
    this.moveSelection(this.getStep(event), 0)
  }

  // 上移
  private handleMoveUp(event: StageKeyboardEventData): void {
    this.moveSelection(0, -this.getStep(event))
  }

  // 下移
  private handleMoveDown(event: StageKeyboardEventData): void {
    this.moveSelection(0, this.getStep(event))
  }

  // 按住 Shift 加速移动
  private getStep(event: StageKeyboardEventData): number {
    return event.evt.shiftKey ? KeyDownPlugin.MOVE_STEP_FAST : KeyDownPlugin.MOVE_STEP
  }

  // 方向键移动选中元素（与拖动一致，使用 TransformElementCommand 支持撤销/重做）
  private moveSelection(dx: number, dy: number): void {
    if (!this.host) return
    const selector = this.host.getPlugin('selection-plugin')
    if (!selector) return

    const elements = selector.getSelectionElements()
    if (elements.length === 0) return

    const commands = elements
      .filter((el) => !el.locked)
      .map((el) => {
        const oldAttrs = { x: el.x, y: el.y }
        const newAttrs = { x: el.x + dx, y: el.y + dy }
        return new TransformElementCommand(this.host!, el, oldAttrs, newAttrs)
      })

    if (commands.length === 0) return

    const batch = new BatchCommand(this.host, commands, '方向键移动元素')
    this.host.executeCommand(batch)
  }

  private isInputFocused(): boolean {
    const active = document.activeElement as HTMLElement | null
    if (!active) return false
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return true
    return active.isContentEditable
  }

  private copySelection(): void {
    if (!this.host) return
    const selection = this.host.getPlugin('selection-plugin').getSelectionElements()
    if (selection.length === 0) return
    this.host.getPlugin('clipboard-plugin').copy(selection)
  }

  private pasteFromClipboard(): void {
    if (!this.host) return
    const clipboard = this.host.getPlugin('clipboard-plugin')
    if (!clipboard.hasData()) return
    clipboard.paste()
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
}

// 将 KeyDownPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'keydown-plugin': KeyDownPlugin
  }
}
