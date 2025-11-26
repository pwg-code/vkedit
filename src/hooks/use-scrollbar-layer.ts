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

  // 可见高度（实际用于显示内容的区域）
  const visibleHeight = computed(() => height.value)

  // 可见宽度（实际用于显示内容的区域）
  const visibleWidth = computed(() => width.value)

  const scrollbarLayerRef = ref()

  // 扩展内容区域为2倍，使边缘内容可以滚动到屏幕中间
  const extendedContentHeight = computed(() => contentHeight.value * 2)
  const extendedContentWidth = computed(() => contentWidth.value * 2)

  // 显示垂直滚动条
  const showVerticalScroll = computed(() => extendedContentHeight.value > visibleHeight.value)

  // 垂直轨道的高度
  const verticalTrackHeight = computed(() => height.value)

  // 垂直滚动块的高度（保持合理的最小高度）
  const verticalThumbHeight = computed(() => {
    if (!showVerticalScroll.value) return verticalTrackHeight.value
    const calculatedHeight =
      (visibleHeight.value / extendedContentHeight.value) * verticalTrackHeight.value
    return Math.max(30, calculatedHeight) // 最小30px
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
    // 计算滚动比例
    const scrollableTrackHeight = verticalTrackHeight.value - verticalThumbHeight.value
    const scrollableContentHeight = extendedContentHeight.value - visibleHeight.value
    if (scrollableTrackHeight <= 0 || scrollableContentHeight <= 0) return contentHeight.value / 2

    const scrollRatio = verticalThumbY.value / scrollableTrackHeight
    // 偏移量让内容可以滚动到中心，起始位置在内容的1/4处（因为扩展了2倍）
    return -(scrollRatio * scrollableContentHeight) + contentHeight.value / 2
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
  const showHorizontalScroll = computed(() => extendedContentWidth.value > visibleWidth.value)

  // 水平轨道的宽度
  const horizontalTrackWidth = computed(() => width.value)

  // 水平滚动块的宽度（保持合理的最小宽度）
  const horizontalThumbWidth = computed(() => {
    if (!showHorizontalScroll.value) return horizontalTrackWidth.value
    const calculatedWidth =
      (visibleWidth.value / extendedContentWidth.value) * horizontalTrackWidth.value
    return Math.max(30, calculatedWidth) // 最小30px
  })

  // 监控 水平滚动块的宽度 设置滚动位置  使其始终保存在中间
  watch(horizontalThumbWidth, (v) => {
    if (!showHorizontalScroll.value) {
      horizontalThumbX.value = (horizontalTrackWidth.value - v) / 2
    }
  })

  // 内容滚动的X位置
  const contentScrollX = computed(() => {
    if (!showHorizontalScroll.value) return contentX.value
    // 计算滚动比例
    const scrollableTrackWidth = horizontalTrackWidth.value - horizontalThumbWidth.value
    const scrollableContentWidth = extendedContentWidth.value - visibleWidth.value
    if (scrollableTrackWidth <= 0 || scrollableContentWidth <= 0) return contentWidth.value / 2

    const scrollRatio = horizontalThumbX.value / scrollableTrackWidth
    // 偏移量让内容可以滚动到中心，起始位置在内容的1/4处（因为扩展了2倍）
    return -(scrollRatio * scrollableContentWidth) + contentWidth.value / 2
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
  // 将内容区域定位到可见区域的正中间
  function resetScrollbarPosition() {
    // 垂直方向:将滑块设置到中间位置,使内容居中显示
    const scrollableTrackHeight = verticalTrackHeight.value - verticalThumbHeight.value
    verticalThumbY.value = scrollableTrackHeight / 2

    // 水平方向:将滑块设置到中间位置,使内容居中显示
    const scrollableTrackWidth = horizontalTrackWidth.value - horizontalThumbWidth.value
    horizontalThumbX.value = scrollableTrackWidth / 2
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
