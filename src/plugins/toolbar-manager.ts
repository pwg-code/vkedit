import { BasePlugin } from '../types/base-plugin'
import type { ToolEventData } from '../types'

export class ToolbarManagerPlugin extends BasePlugin {
  name = 'toolbar-manager-plugin'
  version = '1.0.0'
  private toolbars = new Map<string, ToolEventData>()

  protected onInstall(): void {
    if (!this.host) return
    this.host.on('tool:registered', this.handleRegistered.bind(this))
  }
  protected onUninstall(): void {
    if (!this.host) return
    this.host.off('tool:unregistered', this.handleRegistered.bind(this))
  }

  private handleRegistered(toolbar: ToolEventData): void {
    this.toolbars.set(toolbar.toolName, toolbar)
  }

  public getTools(): ToolEventData[] {
    return Array.from(this.toolbars.values())
  }
}

// 将 ToolbarManagerPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'toolbar-manager-plugin': ToolbarManagerPlugin
  }
}
