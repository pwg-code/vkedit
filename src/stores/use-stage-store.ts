import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useElementSize } from '@vueuse/core'

export const useStageStore = defineStore('stage', () => {
  // 舞台父div ref对象 用于获取响应式宽高
  const stageWrapperRef = ref<HTMLElement | null>(null)

  // 舞台 ref对象 用于获取响应式宽高
  const stageRef = ref()

  const { width, height } = useElementSize(stageWrapperRef)

  // 当前垂直滑块位置
  const verticalThumbY = ref(0)

  // 当前水平滑块位置
  const horizontalThumbX = ref(0)

  // 舞台配置
  const stageConfig = computed(() => {
    return {
      width: width.value,
      height: height.value,
      scaleX: 1,
      scaleY: 1,
    }
  })

  return { stageRef, stageWrapperRef, stageConfig, width, height, verticalThumbY, horizontalThumbX }
})
