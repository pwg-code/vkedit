import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useElementSize } from '@vueuse/core'
import type { CursorMode } from '@/types'

export const useStageStore = defineStore('stage', () => {
  // 舞台父div ref对象 用于获取响应式宽高
  const stageWrapperRef = ref<HTMLElement | null>(null)

  // 舞台 ref对象 用于获取响应式宽高
  const stageRef = ref()

  const { width, height } = useElementSize(stageWrapperRef)

  const currentCursorMode = ref<CursorMode>('default')
  const mouseStageX = ref(0)
  const mouseStageY = ref(0)
  const spacePressed = ref(false)
  const isPanning = ref(false)
  const offsetX = ref(0)
  const offsetY = ref(0)

  // 舞台配置
  const stageConfig = computed(() => {
    return {
      width: width.value,
      height: height.value,
      scaleX: 1,
      scaleY: 1,
    }
  })

  return {
    stageRef, stageWrapperRef, stageConfig, width, height,
    currentCursorMode, mouseStageX, mouseStageY, spacePressed, isPanning,
    offsetX, offsetY,
  }
})
