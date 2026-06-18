/*
内容图层
*/

import { computed, ref } from 'vue'
import { useZoom } from './use-zoom'
import { type IGraphicElement } from '@/types'
import { type EditorHost } from '@/core'
import { TransformElementCommand } from '@/commands'

const DEFAULT_ANCHORS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
  'top-center',
  'bottom-center',
]
const CORNER_ANCHORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

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
      const hasBarcode = selection.some((e) => e.type === 'barcode')
      const hasNonBarcode = selection.some((e) => e.type !== 'barcode')
      const isSingleQrcode = selection.length === 1 && selection[0].type === 'qr'
      if (hasBarcode && !hasNonBarcode) {
        transformerNode.enabledAnchors([])
      } else if (isSingleQrcode) {
        transformerNode.enabledAnchors(CORNER_ANCHORS)
      } else {
        transformerNode.enabledAnchors(DEFAULT_ANCHORS)
      }
      transformerNode.rotateEnabled(true)
    }
  }

  let command: TransformElementCommand
  let isTransforming = false
  let isAltCloning = false

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

  // 图形拖拽
  const handleDragEnd = (event: any, element: any) => {
    const eAttrs = event.target.attrs
    const isAltClone = event.evt.altKey

    if (isAltClone) {
      if (isAltCloning) return
      isAltCloning = true
      setTimeout(() => { isAltCloning = false }, 100)
      // Alt 克隆：原元素不动，副本留于松开处
      const releaseX = eAttrs.x
      const releaseY = eAttrs.y
      event.target.x(element.x)
      event.target.y(element.y)
      const dpm = host.status.dpm || 8
      const deltaMM = {
        x: (releaseX - element.x) / dpm,
        y: (releaseY - element.y) / dpm,
      }
      const selectionPlugin = host.getPlugin('selection-plugin')
      const selection = selectionPlugin.getSelectionElements()
      const targets = selection.length > 0 ? selection : [element]
      host.getPlugin('clipboard-plugin').cloneElementsAt(targets, deltaMM)
      return
    }

    // 普通拖拽移动（原逻辑）
    const newAttrs = { x: eAttrs.x, y: eAttrs.y }
    const oldAttrs = { x: element.x, y: element.y }
    const command = new TransformElementCommand(host, element, oldAttrs, newAttrs)
    host.executeCommand(command)
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
    handleDragEnd,
    handleElementTransform,
    handleElementTransformEnd,
    updateTransformerNodes,
    updateCanvas,
  }
}
