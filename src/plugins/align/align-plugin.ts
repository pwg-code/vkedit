import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '@/types/base-plugin'
import type { IToolbar } from '@/types'
import Align from './Align.vue'

export class AlignPlugin extends BasePlugin {
  name = 'align'
  version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    this.host.emit(EditorEvents.TOOL_REGISTERED, this.getTool())
  }

  private getTool(): IToolbar {
    return {
      name: 'align',
      getComponent() {
        return Align
      },
    }
  }
}
