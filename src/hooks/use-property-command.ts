import { BatchCommand, UpdatePropertyCommand, type ICommand } from '@/commands'
import type { IGraphicElement } from '@/types'
import type { EditorHost } from '@/core'
import { get } from 'lodash'

export function usePropertyCommand(host: EditorHost) {
  const updateProperty = (element: IGraphicElement, propertyPath: string, newValue: any) => {
    const oldValue = get(element, propertyPath)
    if (oldValue === newValue) return
    host.executeCommand(new UpdatePropertyCommand(element, host, propertyPath, oldValue, newValue))
  }

  // 批量更新属性
  const batchUpdateProperty = (
    elements: IGraphicElement[],
    propertyPath: string,
    newValue: any,
  ) => {
    if (elements.length === 0) return
    if (elements.length === 1) return updateProperty(elements[0], propertyPath, newValue)

    const comms: ICommand[] = []
    elements.forEach((e) => {
      let oldValue = get(e, propertyPath)
      if (oldValue !== newValue) {
        comms.push(new UpdatePropertyCommand(e, host, propertyPath, oldValue, newValue))
      }
    })
    host.executeCommand(new BatchCommand(host, comms))
  }

  return { updateProperty, batchUpdateProperty }
}
