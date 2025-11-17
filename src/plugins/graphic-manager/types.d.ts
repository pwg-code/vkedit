import type { Component } from 'vue'
import type { BaseEventData, IGraphicElement } from '@/types'

// Graphic events payloads (moved from central event-data)
export interface GraphicRegisteredEventData extends BaseEventData {
  type: string
  render: () => Component
}

export interface GraphicToolRegisteredEventData extends BaseEventData {
  type: string
  render: () => Component
}

declare module '@/types' {
  interface EventMap {
    'graphic:registered': (payload: GraphicRegisteredEventData) => void
    'graphic:unregistered': (payload: GraphicRegisteredEventData) => void
    'graphic-tool:registered': (payload: GraphicToolRegisteredEventData) => void
    'graphic-tool:unregistered': (payload: GraphicToolRegisteredEventData) => void
  }
}
