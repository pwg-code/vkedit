import type { EditorHost } from '@/core'
import type { IGraphicElement } from '@/types/base'

export interface ShapeProps<T extends IGraphicElement = IGraphicElement> {
  element: T
  host: EditorHost
}
