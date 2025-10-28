import { storeToRefs } from 'pinia'
import { useStageStore } from '@/stores/use-stage-store'

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
