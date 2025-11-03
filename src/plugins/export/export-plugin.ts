/*
导出功能插件
*/

import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '@/types/base-plugin'
import type { IToolbar } from '@/types'
import Export from './Export.vue'

export class ExportPlugin extends BasePlugin {
  name = 'export'
  version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    this.host.emit(EditorEvents.TOOL_REGISTERED, this.getTool())
  }

  private getTool(): IToolbar {
    return {
      name: 'export',
      getComponent() {
        return Export
      },
    }
  }
}
