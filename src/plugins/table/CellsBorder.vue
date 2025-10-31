<template>
  <v-shape :config="config"> </v-shape>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableElement } from './table-plugin'
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
      if (c.visible) {
        context.moveTo(c.x, c.y)
        context.lineTo(c.x + c.width, c.y)
        context.moveTo(c.x, c.y)
        context.lineTo(c.x, c.y + c.height)
      }
    })
  })
  context.closePath()
  context.fillStrokeShape(shape)
}
</script>

<style scoped></style>
