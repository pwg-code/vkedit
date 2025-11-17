import type { BaseEventData } from '@/types'

export interface ExportEventData extends BaseEventData {
  format: 'png' | 'jpeg' | 'pdf' | 'json' | 'excel' | string
  error?: any
}

declare module '@/types' {
  interface EventMap {
    'export:start': (payload: ExportEventData) => void
    'export:complete': (payload: ExportEventData) => void
    'export:error': (payload: ExportEventData) => void
    'export:progress': (payload: ExportEventData) => void
  }
}
