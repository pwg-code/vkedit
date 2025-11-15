<template>
  <v-shape :config="config"> </v-shape>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { WorksheetElement } from './worksheet'
import konva from 'konva'

const { element } = defineProps<{ element: WorksheetElement }>()

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
      // 绘制左侧边框
      if (c.border?.left?.style === 'thin') {
        drawLine(context, c.x, c.y, c.x, c.y + c.height, c.border.left.color?.argb || 'black')
      }
      // 绘制右侧边框
      if (c.border?.right?.style === 'thin') {
        drawLine(
          context,
          c.x + c.width,
          c.y,
          c.x + c.width,
          c.y + c.height,
          c.border.right.color?.argb || 'black',
        )
      }
      // 绘制顶部边框
      if (c.border?.top?.style === 'thin') {
        drawLine(context, c.x, c.y, c.x + c.width, c.y, c.border.top.color?.argb || 'black')
      }
      // 绘制底部边框
      if (c.border?.bottom?.style === 'thin') {
        drawLine(
          context,
          c.x,
          c.y + c.height,
          c.x + c.width,
          c.y + c.height,
          c.border.bottom.color?.argb || 'black',
        )
      }
    })
  })

  context.closePath()
  context.fillStrokeShape(shape)
}

// 画线
function drawLine(
  context: konva.Context,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
) {
  context.beginPath()
  context.strokeStyle = color
  context.moveTo(startX, startY)
  context.lineTo(endX, endY)
  context.stroke()
  context.closePath()
}
</script>

<style scoped></style>
