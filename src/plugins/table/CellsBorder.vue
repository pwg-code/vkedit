<template>
  <v-shape :config="config"> </v-shape>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableElement } from './table'
import konva from 'konva'

const { element } = defineProps<{ element: TableElement }>()

const cells = computed(() => element.cells)

const config = ref<konva.ShapeConfig>({
  stroke: 'black',
  strokeWidth: 1,
  sceneFunc,
})

// 绘制函数
function sceneFunc(context: konva.Context, shape: konva.Shape) {
  context.beginPath()
  cells.value.forEach((row, i) => {
    row.forEach((c, j) => {
      if (!c.visible) return
      if (c.borderUp) {
        context.moveTo(c.x, c.y)
        context.lineTo(c.x + c.width, c.y)
      }
      if (c.borderLeft) {
        context.moveTo(c.x, c.y)
        context.lineTo(c.x, c.y + c.height)
      }
    })
  })

  // 整体左侧 和底部边框
  context.moveTo(element.width, 0)
  context.lineTo(element.width, element.height)
  context.moveTo(0, element.height)
  context.lineTo(element.width, element.height)

  context.closePath()
  context.fillStrokeShape(shape)
}
</script>

<style scoped></style>
