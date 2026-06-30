/*
内容图层
*/

import { computed, ref } from 'vue'
import { useZoom } from './use-zoom'
import { type IGraphicElement, DEFAULT_ANCHORS } from '@/types'
import { type EditorHost } from '@/core'
import { TransformElementCommand, BatchCommand } from '@/commands'

export function useContentLayer(host: EditorHost) {
  // 图层
  const contentLayerRef = ref()

  // 转换器
  const transformerRef = ref()

  // 缩放逻辑hook
  const { zoom, contentX, contentY } = useZoom(host)

  const contentLayerConfig = computed(() => {
    return {}
  })

  const contentGroupConfig = computed(() => {
    return {
      x: contentX.value,
      y: contentY.value,
      scaleX: zoom.value,
      scaleY: zoom.value,
    }
  })

  // 所有的图像元素
  const elements = ref<IGraphicElement[]>([])
  const initElements = () => {
    const a = host.getPlugin('element-manager-plugin')?.elements.values()
    if (a) {
      elements.value = Array.from(a)
    }
  }

  // 更新画布
  function updateCanvas() {
    elements.value = [...elements.value]
  }

  // 更新选中元素
  const updateTransformerNodes = (selection: IGraphicElement[]) => {
    const nodes: any[] = []
    if (!contentLayerRef.value) return
    selection.forEach((e) => {
      const node = contentLayerRef.value.getNode().findOne('#' + e.id)
      if (node && e.transferable) {
        nodes.push(node)
      }
    })

    const transformerNode = transformerRef.value.getNode()
    if (transformerNode) {
      transformerNode.nodes(nodes)
      const resolveAnchors = (e: IGraphicElement): string[] | null =>
        e.resizeAnchors === undefined ? DEFAULT_ANCHORS : e.resizeAnchors
      if (selection.length === 1) {
        const anchors = resolveAnchors(selection[0])
        transformerNode.enabledAnchors(anchors === null ? [] : anchors)
      } else if (selection.length > 1) {
        const allDisabled = selection.every((e) => resolveAnchors(e) === null)
        transformerNode.enabledAnchors(allDisabled ? [] : DEFAULT_ANCHORS)
      }
      transformerNode.rotateEnabled(true)
    }
  }

  let command: TransformElementCommand
  let isTransforming = false
  let isAltCloning = false
  let multiDragStartPositions: Map<string, { x: number; y: number }> | null = null
  let multiDraggedId: string | null = null

  // 图形变换更改属性
  const handleElementTransform = (event: any, element: IGraphicElement) => {
    if (element?.getTransformAttr) {
      const { oldAttrs, newAttrs } = element.getTransformAttr(event)
      command = new TransformElementCommand(host, element, oldAttrs, newAttrs)
    } else {
      const { oldAttrs, newAttrs } = getTransformAttr(event, element)
      command = new TransformElementCommand(host, element, oldAttrs, newAttrs)
    }

    if (!isTransforming) {
      isTransforming = true
      host.executeCommand(command)
    } else {
      command.execute()
    }
  }

  // 图形变换更改属性
  const handleElementTransformEnd = (event: any, element: any) => {
    // 结束入栈
    host.executeCommand(command)
    isTransforming = false
  }

  const handleDragStart = (event: any, element: any) => {
    host.emit('element:dragstart', {
      element,
      elementId: element.id,
      target: event.target,
      evt: event.evt,
      source: 'use-content-layer',
      timestamp: Date.now(),
    })

    const selectionPlugin = host.getPlugin('selection-plugin')
    const selection = selectionPlugin?.getSelectionElements() ?? []
    multiDraggedId = element.id
    if (selection.length > 1 && selection.some((e) => e.id === element.id)) {
      multiDragStartPositions = new Map()
      selection.forEach((e) => {
        const node = host.contentLayer?.getNode?.().findOne('#' + e.id)
        if (node) {
          multiDragStartPositions!.set(e.id, { x: node.x(), y: node.y() })
        }
      })
    } else {
      multiDragStartPositions = null
    }
  }

  const handleDragMove = (event: any, element: any) => {
    if (
      multiDragStartPositions &&
      multiDraggedId === element.id &&
      multiDragStartPositions.has(element.id)
    ) {
      const start = multiDragStartPositions.get(element.id)!
      const deltaX = event.target.x() - start.x
      const deltaY = event.target.y() - start.y
      multiDragStartPositions.forEach((pos, id) => {
        if (id === element.id) return
        const node = host.contentLayer?.getNode?.().findOne('#' + id)
        if (node) {
          node.x(pos.x + deltaX)
          node.y(pos.y + deltaY)
        }
      })
    }

    host.emit('element:dragmove', {
      element,
      elementId: element.id,
      target: event.target,
      evt: event.evt,
      source: 'use-content-layer',
      timestamp: Date.now(),
    })
  }

  // 图形拖拽
  const handleDragEnd = (event: any, element: any) => {
    host.emit('element:dragend', {
      element,
      elementId: element.id,
      target: event.target,
      evt: event.evt,
      source: 'use-content-layer',
      timestamp: Date.now(),
    })

    const eAttrs = event.target.attrs
    const isAltClone = event.evt.altKey

    if (isAltClone) {
      // Alt 克隆：原元素不动，副本留于松开处
      const releaseX = eAttrs.x
      const releaseY = eAttrs.y
      event.target.x(element.x)
      event.target.y(element.y)
      if (isAltCloning) return
      isAltCloning = true
      setTimeout(() => { isAltCloning = false }, 100)
      const dpm = host.status.dpm || 8
      const deltaMM = {
        x: (releaseX - element.x) / dpm,
        y: (releaseY - element.y) / dpm,
      }
      const selectionPlugin = host.getPlugin('selection-plugin')
      const selection = selectionPlugin.getSelectionElements()
      const targets = selection.length > 0 ? selection : [element]
      host.getPlugin('clipboard-plugin').cloneElementsAt(targets, deltaMM)
      multiDragStartPositions = null
      return
    }

    const isMultiDrag =
      multiDragStartPositions &&
      multiDragStartPositions.has(element.id) &&
      multiDragStartPositions.size > 1

    if (isMultiDrag) {
      const selectionPlugin = host.getPlugin('selection-plugin')
      const selection = selectionPlugin.getSelectionElements()
      const commands = selection
        .map((e) => {
          const node = host.contentLayer?.getNode?.().findOne('#' + e.id)
          const start = multiDragStartPositions!.get(e.id)
          if (!node || !start) return null
          const oldAttrs = { x: start.x, y: start.y }
          const newAttrs = { x: node.x(), y: node.y() }
          return new TransformElementCommand(host, e, oldAttrs, newAttrs)
        })
        .filter((c): c is TransformElementCommand => c !== null)
      if (commands.length > 0) {
        host.executeCommand(new BatchCommand(host, commands, '多选拖拽'))
      }
      multiDragStartPositions = null
      multiDraggedId = null
      return
    }

    // 普通拖拽移动（原逻辑）
    const newAttrs = { x: eAttrs.x, y: eAttrs.y }
    const oldAttrs = { x: element.x, y: element.y }
    const command = new TransformElementCommand(host, element, oldAttrs, newAttrs)
    host.executeCommand(command)
    multiDragStartPositions = null
    multiDraggedId = null
  }

  // 获取转换的属性
  const getTransformAttr = (event: any, element: any) => {
    const eAttrs = event.target.attrs
    const oldAttrs = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      scaleX: 1,
      scaleY: 1,
      rotation: element.rotation,
    }
    const newAttrs = {
      x: eAttrs.x,
      y: eAttrs.y,
      width: element.width * eAttrs.scaleX,
      height: element.height * eAttrs.scaleY,
      scaleX: 1,
      scaleY: 1,
      rotation: eAttrs.rotation,
    }
    return { oldAttrs, newAttrs }
  }

  return {
    contentLayerRef,
    transformerRef,
    contentLayerConfig,
    contentGroupConfig,
    elements,
    initElements,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleElementTransform,
    handleElementTransformEnd,
    updateTransformerNodes,
    updateCanvas,
  }
}
