import { computed, toRef } from 'vue'
import type { EditorHost } from '@/core'

// 舞台门面工厂：所有舞台交互状态与视口尺寸均读自 host.stageState（按实例隔离）
// 不再返回 stageRef / stageWrapperRef，这两个由 StageView 本地持有
export function useStage(host: EditorHost) {
  return {
    // 视口尺寸（门面名保持 width/height，读自 host.stageState.viewportWidth/Height）
    width: computed(() => host.stageState.viewportWidth),
    height: computed(() => host.stageState.viewportHeight),
    stageConfig: computed(() => ({
      width: host.stageState.viewportWidth,
      height: host.stageState.viewportHeight,
      scaleX: 1,
      scaleY: 1,
    })),
    // 交互状态（toRef 于 reactive 子对象，写入即回写 host，保持 .value = x 赋值可用）
    currentCursorMode: toRef(host.stageState, 'currentCursorMode'),
    mouseStageX: toRef(host.stageState, 'mouseStageX'),
    mouseStageY: toRef(host.stageState, 'mouseStageY'),
    spacePressed: toRef(host.stageState, 'spacePressed'),
    isPanning: toRef(host.stageState, 'isPanning'),
    offsetX: toRef(host.stageState, 'offsetX'),
    offsetY: toRef(host.stageState, 'offsetY'),
  }
}
