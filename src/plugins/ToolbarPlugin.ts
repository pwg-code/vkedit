import { EditorEvents } from '@/types/EventTypes'
import { BasePlugin } from '../types/BasePlugin'
import type { IGraphicElement, Point2D, IToolbar } from '../types'
import type { ElementsPlugin } from './ElementsPlugin'

export class ToolbarPlugin extends BasePlugin {
  name = 'toolbar'
  version = '1.0.0'
  private toolbars = new Map<string, IToolbar>()

  protected onInstall(): void {
    if (!this.host) return
    this.host.on(EditorEvents.TOOL_REGISTERED, this.handleRegistered.bind(this))
  }
  protected onUninstall(): void {
    if (!this.host) return
    this.host.off(EditorEvents.TOOL_REGISTERED, this.handleRegistered.bind(this))
  }

  private handleRegistered(toolbar: IToolbar) {
    this.toolbars.set(toolbar.name, toolbar)
  }

  public getTools(): IToolbar[] {
    return Array.from(this.toolbars.values())
  }
}
