import type { Component } from 'vue'
import type { BaseEventData } from '@/types'

export interface PropertyRegisteredPanelEventData extends BaseEventData {
  graphicTypes: string[]
  isPublic: boolean
  isCanvas: boolean
  render: () => Component
}

declare module '@/types' {
  interface EventMap {
    'property-panel:registered': (payload: PropertyRegisteredPanelEventData) => void
    'property-panel:unregistered': (payload: PropertyRegisteredPanelEventData) => void
  }
}
