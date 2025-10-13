import type { Component } from 'vue'
import type { IGraphicElement, IGraphicType } from '.'

export abstract class BaseGraphicType implements IGraphicType {
  abstract readonly type: string
  abstract render(): Component
  abstract renderTool(): Component
  abstract renderPropertyPanel(): Component
  abstract createElement(x: number, y: number): IGraphicElement
  // 获取转换的属性
  getTransformAttr(event: any, element: any) {
    const eAttrs = event.target.attrs
    const oldAttrs = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      scaleX: 1,
      scaleY: 1,
      rotation: element.rotation,
    }
    const newAttrs = {
      x: eAttrs.x,
      y: eAttrs.y,
      width: element.width * eAttrs.scaleX,
      height: element.height * eAttrs.scaleY,
      scaleX: 1,
      scaleY: 1,
      rotation: eAttrs.rotation,
    }
    return { oldAttrs, newAttrs }
  }
}
