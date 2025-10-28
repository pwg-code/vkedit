/*
内容图层
*/

import { computed, onMounted, ref } from 'vue'
import useZoom from './use-zoom'
import { EditorEvents, type IEditorHost, type IGraphicElement } from '@/types'
import type { ElementsPlugin, GraphicTypesPlugin } from '@/plugins'
import { TransformElementCommand } from '@/commands'
import useScrollbarLayer from './use-scrollbar-layer'

export default function (host: IEditorHost) {
  // 图层
  const contentLayerRef = ref()

  // 转换器
  const transformerRef = ref()

  // 图形类插件
  const graphicTypesPlugin = host.getPlugin<GraphicTypesPlugin>('graphic-types')

  // 缩放逻辑hook
  const { contentHeight, contentWidth, contentX, contentY, zoom } = useZoom(host)
  const { contentScrollX, contentScrollY } = useScrollbarLayer(host)

  // 内容图层配置
  const contentLayerConfig = computed(() => {
    return {}
  })

  // 内容图层底板
  const contentBgConfig = computed(() => {
    return {
      x: contentScrollX.value,
      y: contentScrollY.value,
      width: contentWidth.value,
      height: contentHeight.value,
      fill: 'rgba(255, 255, 255, 1)',
      zIndex: 0,
    }
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
    const a = host.getPlugin<ElementsPlugin>('elements')?.elements.values()
    if (a) {
      elements.value = Array.from(a)
    }
  }

  // 更新画布
  function updateCanvas() {
    elements.value = [...elements.value]
  }

  // 更新选中元素
  const updateTransformerNodes = (selection: Map<string, IGraphicElement>) => {
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
  const handleElementTransform = (event: any, element: any) => {
    // 如果图形元素没有提供getTransformAttr则使用默认
    const graphicType = graphicTypesPlugin?.getGraphicType(element.type)
    if (graphicType?.getTransformAttr) {
      const { oldAttrs, newAttrs } = graphicType.getTransformAttr(event, element)
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

  onMounted(() => {
    // 添加或删除图形时触发更新elements
    host.on('element:removed', initElements)
    host.on('element:added', initElements)

    // 选中变更事件
    host.on(EditorEvents.SELECTION_CHANGED, updateTransformerNodes)
    host.on(EditorEvents.ELEMENT_TRANSFORMED, initElements)
    host.on(EditorEvents.ELEMENT_UPDATED, updateCanvas)
    host.on(EditorEvents.PROPERTY_VALUE_CHANGE, updateCanvas)
    host.on(EditorEvents.ELEMENTS_ALIGN, updateCanvas)

    // 将内容图层赋值给宿主  以便其他插件使用
    host.layer = contentLayerRef.value
  })

  return {
    contentLayerRef,
    transformerRef,
    contentLayerConfig,
    contentBgConfig,
    contentGroupConfig,
    elements,
    graphicTypesPlugin,
    initElements,
    handleDragEnd,
    handleElementTransform,
    handleElementTransformEnd,
  }
}
