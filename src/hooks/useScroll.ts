import { computed, reactive, ref } from 'vue'

// 处理缩放相关的逻辑
export default function (stageConfig: any, hostState: any) {
  // 显示垂直滚动条
  const showVerticalScroll = computed(() => {
    // 当内容区的高度大于画布的高度是
    if (stageConfig.value) {
    }
  })

  // 显示水平滚动条
  const showHorizontalScroll = computed(() => {})

  // 垂直滚动块的高度
  const verticalThumbHeight = computed(() => {})

  // 水平滚动块的高度
  const horizontalThumbWidth = computed(() => {})

  return {}
}
