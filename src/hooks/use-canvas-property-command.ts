import { UpdateCanvasPropertyCommand, type CanvasPropertyPath } from '@/commands'
import type { EditorHost } from '@/core'

export function useCanvasPropertyCommand(host: EditorHost) {
  const updateCanvasProperty = (propertyPath: CanvasPropertyPath, newValue: number) => {
    const oldValue = host.status[propertyPath]
    if (oldValue === newValue) return

    const oldState = {
      dpm: host.status.dpm,
      width: host.status.width,
      height: host.status.height,
      wmm: host.status.wmm,
      hmm: host.status.hmm,
    }

    const newStatus = { [propertyPath]: newValue }

    host.executeCommand(
      new UpdateCanvasPropertyCommand(host, propertyPath, oldState, newStatus),
    )
  }

  return { updateCanvasProperty }
}
