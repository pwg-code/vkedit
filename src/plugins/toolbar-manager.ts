import { BasePlugin } from '../types/base-plugin'
import type { ToolEventData, ToolGroup } from '../types'

const DEFAULT_GROUP: ToolGroup = 'tools'

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

  public getToolsByGroup(group: ToolGroup): ToolEventData[] {
    return Array.from(this.toolbars.values()).filter(
      (t) => (t.group ?? DEFAULT_GROUP) === group,
    )
  }

  public getGroupedTools(): Record<string, ToolEventData[]> {
    const result: Record<string, ToolEventData[]> = {}
    for (const tool of this.toolbars.values()) {
      const g = tool.group ?? DEFAULT_GROUP
      if (!result[g]) result[g] = []
      result[g].push(tool)
    }
    return result
  }
}

// 将 ToolbarManagerPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'toolbar-manager-plugin': ToolbarManagerPlugin
  }
}
