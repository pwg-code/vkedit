import { computed, reactive, ref } from 'vue'

// 处理缩放相关的逻辑
export default function (stageConfig: any, hostState: any) {

  // 内容区的配置
  const contentWidth = computed(() => hostState.value.width * hostState.value.zoom)
  const contentHeight= computed(() => hostState.value.height * hostState.value.zoom)
  const contentX= computed(() => stageConfig.value.width / 2 - contentWidth.value / 2)
  const contentY= computed(() => stageConfig.value.height / 2 - contentHeight.value / 2)

  return { contentWidth, contentHeight ,contentX, contentY}
}
