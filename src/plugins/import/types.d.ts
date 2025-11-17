import type { BaseEventData } from '@/types'

export interface ImportEventData extends BaseEventData {
  format: 'json' | 'excel' | string
  error?: any
}

declare module '@/types' {
  interface EventMap {
    'import:start': (payload: ImportEventData) => void
    'import:complete': (payload: ImportEventData) => void
    'import:error': (payload: ImportEventData) => void
    'import:progress': (payload: ImportEventData) => void
  }
}
