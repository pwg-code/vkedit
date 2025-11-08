import type { Component } from 'vue'
import type { IGraphicElement, IGraphicType } from '.'

export abstract class BaseGraphicType implements IGraphicType {
  abstract readonly type: string
  abstract render(): Component
  abstract renderTool(): Component
  abstract renderPropertyPanel(): Component
  abstract createElement(x: number, y: number): IGraphicElement
}
