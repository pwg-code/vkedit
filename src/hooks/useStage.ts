import { storeToRefs } from 'pinia'
import { useStageStore } from '@/stores/useStageStore'

export default function () {
  const {
    stageRef,
    stageWrapperRef,
    stageConfig,
    width,
    height,
    verticalThumbY,
    horizontalThumbX,
  } = storeToRefs(useStageStore())
  return {
    stageRef,
    stageWrapperRef,
    stageConfig,
    width,
    height,
    verticalThumbY,
    horizontalThumbX,
  }
}
