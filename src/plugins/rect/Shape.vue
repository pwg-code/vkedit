<template>
  <v-rect v-bind="$attrs" :config="element.config" @click="handleClick" />
</template>

<script setup lang="ts">
import type { RectElement } from './rect'

interface Props {
  element: RectElement
}

const { element } = defineProps<Props>()

const handleClick = (event: any) => {
  // event.cancelBubble = true
}

class A {
  _x: number = 0
  _y: number = 0
  _width: number = 100
  _height: number = 100
  stroke: string = 'black'
  strokeWidth: number = 2

  public get x() {
    return this._x
  }
  public set x(value: number) {
    this._x = value
  }

  public get y() {
    return this._y
  }
  public set y(value: number) {
    this._y = value
  }
  public get width() {
    return this._width
  }
  public set width(value: number) {
    this._width = value
  }
  public get height() {
    return this._height
  }
  public set height(value: number) {
    this._height = value
  }
}

const a = new A()

</script>
