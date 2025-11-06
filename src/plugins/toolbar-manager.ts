import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '../types/base-plugin'
import type { IGraphicElement, Point2D, IToolbar } from '../types'
import type { ElementManagerPlugin } from './element-manager'

export class ToolbarManagerPlugin extends BasePlugin {
  name = 'toolbar-manager-plugin'
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
