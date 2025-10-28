import { computed, reactive, ref, watch } from 'vue'
import useStage from './useStage'
import { useZoom } from '@/hooks'
import type { IEditorHost } from '@/types'

// 处理缩放相关的逻辑
export default function (host: IEditorHost) {
  const { width, height, verticalThumbY, horizontalThumbX } = useStage()
  const { contentHeight, contentWidth, contentX, contentY } = useZoom(host)

  const scrollbarLayerConfig = reactive({
    zIndex: 4,
  })

  const margin = 30

  // 可见高度
  const visibleHeight = computed(() => height.value - margin)

  // 可见高度
  const visibleWidth = computed(() => width.value - margin)

  const scrollbarLayerRef = ref()
  // 显示垂直滚动条
  const showVerticalScroll = computed(() => contentHeight.value > visibleHeight.value)

  // 垂直轨道的高度
  const verticalTrackHeight = computed(() => visibleHeight.value)

  // 垂直滚动块的高度
  const verticalThumbHeight = computed(() => {
    return (visibleHeight.value / contentHeight.value) * verticalTrackHeight.value
  })

  // 监控 垂直滚动块的高度 设置滚动位置  使其始终保存在中间
  watch(verticalThumbHeight, (v) => {
    if (!showVerticalScroll.value) {
      verticalThumbY.value = (verticalTrackHeight.value - v) / 2
    }
  })

  // 内容滚动的Y位置
  const contentScrollY = computed(() => {
    if (!showVerticalScroll.value) return contentY.value
    return (
      -(
        (verticalThumbY.value / (verticalTrackHeight.value - verticalThumbHeight.value)) *
        (contentHeight.value - visibleHeight.value)
      ) + margin
    )
  })

  // 垂直滚动条轨道的配置
  const verticalTrackConfig = computed(() => {
    return {
      x: width.value - 10,
      y: 0,
      width: 10,
      height: height.value,
      fill: '#ffff',
    }
  })

  // 垂直滚动条滑块的配置
  const verticalThumbConfig = computed(() => {
    return {
      x: width.value - 10,
      y: verticalThumbY.value,
      width: 10,
      height: verticalThumbHeight.value,
      fill: '#6666',
      draggable: true,
    }
  })
  // 限制拖动
  const handleVerticalDragMove = (e: any) => {
    if (e.target.y() < 0) {
      e.target.y(0)
    } else if (e.target.y() > verticalTrackConfig.value.height - verticalThumbConfig.value.height) {
      e.target.y(verticalTrackConfig.value.height - verticalThumbConfig.value.height)
    }
    e.target.x(verticalTrackConfig.value.x)
    verticalThumbY.value = e.target.y()
  }

  // 显示水平滚动条
  const showHorizontalScroll = computed(() => contentWidth.value > visibleWidth.value)

  // 水平轨道的宽度
  const horizontalTrackWidth = computed(() => visibleWidth.value)

  // 水平滚动块的高度
  const horizontalThumbWidth = computed(() => {
    return (visibleWidth.value / contentWidth.value) * horizontalTrackWidth.value
  })

  // 监控 水平滚动块的高度 设置滚动位置  使其始终保存在中间
  watch(horizontalThumbWidth, (v) => {
    if (!showHorizontalScroll.value) {
      horizontalThumbX.value = (horizontalTrackWidth.value - v) / 2
    }
  })

  // 内容滚动的X位置
  const contentScrollX = computed(() => {
    if (!showHorizontalScroll.value) return contentX.value
    return (
      -(
        (horizontalThumbX.value / (horizontalTrackWidth.value - horizontalThumbWidth.value)) *
        (contentWidth.value - visibleWidth.value)
      ) + margin
    )
  })

  // 水平滚动条轨道的配置
  const horizontalTrackConfig = computed(() => {
    return {
      x: 0,
      y: height.value - 10,
      width: width.value,
      height: 10,
      fill: '#ffff',
    }
  })

  // 垂直滚动条滑块的配置
  const horizontalThumbConfig = computed(() => {
    return {
      x: horizontalThumbX.value,
      y: height.value - 10,
      width: horizontalThumbWidth.value,
      height: 10,
      fill: '#6666',
      draggable: true,
    }
  })

  // 限制拖动
  const handleHorizontalDragMove = (e: any) => {
    if (e.target.x() < 0) {
      e.target.x(0)
    } else if (
      e.target.x() >
      horizontalTrackConfig.value.width - horizontalThumbConfig.value.width
    ) {
      e.target.x(horizontalTrackConfig.value.width - horizontalThumbConfig.value.width)
    }
    e.target.y(horizontalTrackConfig.value.y)
    horizontalThumbX.value = e.target.x()
  }

  return {
    scrollbarLayerRef,
    scrollbarLayerConfig,
    showVerticalScroll,
    showHorizontalScroll,
    horizontalThumbConfig,
    verticalThumbConfig,
    horizontalTrackConfig,
    verticalTrackConfig,
    handleVerticalDragMove,
    handleHorizontalDragMove,
    contentScrollX,
    contentScrollY,
  }
}
