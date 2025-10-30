import { BatchCommand, UpdatePropertyCommand } from '@/commands'
import type { IEditorHost, IGraphicElement } from '@/types'

export default function (host: IEditorHost) {
  const updateProperty = (
    element: IGraphicElement,
    propertyPath: string,
    oldValue: any,
    newValue: any,
  ) => {
    host.executeCommand(new UpdatePropertyCommand(element, host, propertyPath, oldValue, newValue))
  }

  // 批量更新属性
  const batchUpdateProperty = (
    elements: IGraphicElement[],
    propertyPath: string,
    oldValue: any,
    newValue: any,
  ) => {
    host.executeCommand(
      new BatchCommand(
        host,
        elements.map(
          (item) => new UpdatePropertyCommand(item, host, propertyPath, oldValue, newValue),
        ),
      ),
    )
  }

  return { updateProperty, batchUpdateProperty }
}
