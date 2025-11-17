import type { Component } from 'vue'
import type { BaseEventData } from '@/types'

export interface ContextMenuRegisteredEventData extends BaseEventData {
  render: () => Component
  graphicTypes: string[]
  isPublic: boolean
  isCanvas: boolean
}

declare module '@/types' {
  interface EventMap {
    'context-menu:registered': (payload: ContextMenuRegisteredEventData) => void
    'context-menu:unregistered': (payload: ContextMenuRegisteredEventData) => void
  }
}
