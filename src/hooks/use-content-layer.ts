/*
内容图层
*/

import { computed, onMounted, ref } from 'vue'
import { useZoom } from './use-zoom'
import { type IGraphicElement } from '@/types'
import { type EditorHost } from '@/core'
import type { ElementManagerPlugin } from '@/plugins'
import { TransformElementCommand } from '@/commands'
import { useScrollbarLayer } from './use-scrollbar-layer'

export function useContentLayer(host: EditorHost) {
  // 图层
  const contentLayerRef = ref()

  // 转换器
  const transformerRef = ref()

  // 缩放逻辑hook
  const { zoom } = useZoom(host)
  const { contentScrollX, contentScrollY } = useScrollbarLayer(host)

  // 内容图层配置
  const contentLayerConfig = computed(() => {
    return {}
  })

  // 内容图层组配置
  const contentGroupConfig = computed(() => {
    return {
      x: contentScrollX.value,
      y: contentScrollY.value,
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
      if (node) {
        nodes.push(node)
      } else {
        console.warn('找不到节点', e.id)
      }
    })

    const transformerNode = transformerRef.value.getNode()
    if (transformerNode) {
      transformerNode.nodes(nodes)
    }
  }

  let command: TransformElementCommand
  let isTransforming = false

  // 图形变换更改属性
  const handleElementTransform = (event: any, element: IGraphicElement) => {
    if (element?.getTransformAttr) {
      const { oldAttrs, newAttrs } = element.getTransformAttr(event)
      command = new TransformElementCommand(element, host, oldAttrs, newAttrs)
    } else {
      const { oldAttrs, newAttrs } = getTransformAttr(event, element)
      command = new TransformElementCommand(element, host, oldAttrs, newAttrs)
    }

    // 首次转换入栈
    if (!isTransforming) {
      isTransforming = true
      host.executeCommand(command)
    } else {
      // 中间态不入栈 直接更新属性
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
    const newAttrs = { x: eAttrs.x, y: eAttrs.y }
    const oldAttrs = { x: element.x, y: element.y }
    // 使用命令更改属性
    const command = new TransformElementCommand(element, host, oldAttrs, newAttrs)
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
