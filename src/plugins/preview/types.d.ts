import type { BaseEventData } from '@/types'

export interface PreviewEventData extends BaseEventData {
  // currently same as BaseEventData; kept for future extensions
  error?: any
}

declare module '@/types' {
  interface EventMap {
    'preview:start': (payload: PreviewEventData) => void
    'preview:complete': (payload: PreviewEventData) => void
    'preview:error': (payload: PreviewEventData) => void
  }
}
