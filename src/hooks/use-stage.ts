import { storeToRefs } from 'pinia'
import { useStageStore } from '@/stores/use-stage-store'

export function useStage() {
  const {
    stageRef,
    stageWrapperRef,
    stageConfig,
    width,
    height,
    currentCursorMode,
    mouseStageX,
    mouseStageY,
    spacePressed,
    isPanning,
    offsetX,
    offsetY,
  } = storeToRefs(useStageStore())
  return {
    stageRef,
    stageWrapperRef,
    stageConfig,
    width,
    height,
    currentCursorMode,
    mouseStageX,
    mouseStageY,
    spacePressed,
    isPanning,
    offsetX,
    offsetY,
  }
}
