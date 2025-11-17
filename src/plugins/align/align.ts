import { BasePlugin } from '@/types/base-plugin'
import Align from './Align.vue'

export class AlignPlugin extends BasePlugin {
  name = 'align-plugin'
  version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    this.host.emit('tool:registered', {
      toolName:'align',
      render:()=>Align,
      source:"align-plugin-on-install",
      timestamp:Date.now()
    })
  }
}

// 将 AlignPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'align-plugin': AlignPlugin
  }
}
