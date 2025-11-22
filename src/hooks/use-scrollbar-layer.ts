import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useStage } from './use-stage'
import { useZoom } from '@/hooks'
import { type EditorHost } from '@/core'

// 处理缩放相关的逻辑
export function useScrollbarLayer(host: EditorHost) {
  const { width, height, verticalThumbY, horizontalThumbX } = useStage()
  const { contentHeight, contentWidth, contentX, contentY } = useZoom(host)

  const scrollbarLayerConfig = reactive({})

  const margin = 500

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
      verticalThumbY.value = (verticalTrackHeight.value - v) / 2 + margin / 2
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
      x: width.value - 15,
      y: 0,
      width: 15,
      height: height.value,
      fill: 'rgb(220,220,220,0.5)',
      listening: false,
    }
  })

  // 垂直滚动条滑块的配置
  const verticalThumbConfig = computed(() => {
    return {
      x: width.value - 15,
      y: verticalThumbY.value,
      width: 15,
      height: verticalThumbHeight.value,
      fill: '#6666',
      draggable: true,
    }
  })

  // 垂直滑块的Y位置可用范围
  const verticalThumbYRange = computed(() => {
    const max = verticalTrackConfig.value.height - verticalThumbConfig.value.height
    return { min: 0, max }
  })

  // 取中间值
  function middleValue(a: number, b: number, c: number) {
    if ((a <= b && b <= c) || (c <= b && b <= a)) return b
    if ((b <= a && a <= c) || (c <= a && a <= b)) return a
    return c
  }

  // 限制拖动
  const handleVerticalDragMove = (e: any) => {
    const y = middleValue(
      verticalThumbYRange.value.min,
      verticalThumbYRange.value.max,
      e.target.y(),
    )
    e.target.y(y)
    e.target.x(verticalTrackConfig.value.x)
    verticalThumbY.value = y
  }

  // 显示水平滚动条
  const showHorizontalScroll = computed(() => contentWidth.value > visibleWidth.value)

  // 水平轨道的宽度
  const horizontalTrackWidth = computed(() => visibleWidth.value)

  // 水平滚动块的宽度
  const horizontalThumbWidth = computed(() => {
    return (visibleWidth.value / contentWidth.value) * horizontalTrackWidth.value
  })

  // 监控 水平滚动块的宽度 设置滚动位置  使其始终保存在中间
  watch(horizontalThumbWidth, (v) => {
    if (!showHorizontalScroll.value) {
      horizontalThumbX.value = (horizontalTrackWidth.value - v) / 2 + margin / 2
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
      y: height.value - 15,
      width: width.value,
      height: 15,
      fill: 'rgb(220,220,220,0.5)',
      listening: false,
    }
  })

  // 垂直滚动条滑块的配置
  const horizontalThumbConfig = computed(() => {
    return {
      x: horizontalThumbX.value,
      y: height.value - 15,
      width: horizontalThumbWidth.value,
      height: 15,
      fill: '#6666',
      draggable: true,
    }
  })

  // 水平滑块的X位置可用范围
  const horizontalThumbXRange = computed(() => {
    const max = horizontalTrackConfig.value.width - horizontalThumbConfig.value.width
    return { min: 0, max }
  })

  // 限制拖动
  const handleHorizontalDragMove = (e: any) => {
    const x = middleValue(
      horizontalThumbXRange.value.min,
      horizontalThumbXRange.value.max,
      e.target.x(),
    )
    e.target.x(x)
    e.target.y(horizontalTrackConfig.value.y)
    horizontalThumbX.value = x
  }

  // 鼠标滚轮
  function handleWheel(e: any) {
    verticalThumbY.value = middleValue(
      verticalThumbYRange.value.min,
      verticalThumbYRange.value.max,
      verticalThumbY.value + e.evt.deltaY / 4,
    )
  }

  // 使滚动条在最佳位置
  // 将内容的左上角定位到可见区域的左上角
  function resetScrollbarPosition() {
    // 垂直方向:将滑块设置到顶部,使内容从顶部开始显示
    if (showVerticalScroll.value) {
      verticalThumbY.value = margin / 2
    } else {
      // 不需要滚动时,滑块居中
      verticalThumbY.value =
        (verticalTrackHeight.value - verticalThumbHeight.value) / 2 + margin / 2
    }

    // 水平方向:将滑块设置到左侧,使内容从左侧开始显示
    if (showHorizontalScroll.value) {
      horizontalThumbX.value = margin / 2
    } else {
      // 不需要滚动时,滑块居中
      horizontalThumbX.value =
        (horizontalTrackWidth.value - horizontalThumbWidth.value) / 2 + margin / 2
    }
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
    handleWheel,
    verticalThumbY,
    horizontalThumbX,
    resetScrollbarPosition,
  }
}
