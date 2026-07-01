import { UpdatePropertyCommand } from '@/commands'
import type { IGraphicElement } from '.'
import type { EditorHost } from '@/core'
import { v4 as uuidv4 } from 'uuid'

export const DEFAULT_ANCHORS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
  'top-center',
  'bottom-center',
]
export const CORNER_ANCHORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

export interface BaseGraphicElementOptions {
  xmm?: number
  ymm?: number
  wmm?: number
  hmm?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  visible?: boolean
  locked?: boolean
  draggable?: boolean
  transferable?: boolean
}

export abstract class BaseGraphicElement implements IGraphicElement {
  public get x(): number {
    if (this.host === undefined) {
      // 报错
      throw new Error('Host is undefined. Cannot compute x position without host context.')
    }
    return this.xmm * this.host.status.dpm
  }
  public set x(value: number) {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute x position without host context.')
    }
    this.xmm = value / this.host.status.dpm
  }

  public get y(): number {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute y position without host context.')
    }
    return this.ymm * this.host.status.dpm
  }
  public set y(value: number) {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute y position without host context.')
    }
    this.ymm = value / this.host.status.dpm
  }

  public get height(): number {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute height without host context.')
    }
    return this.hmm * this.host.status.dpm
  }
  public set height(value: number) {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute height without host context.')
    }
    this.hmm = value / this.host.status.dpm
  }

  public get width(): number {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute width without host context.')
    }
    return this.wmm * this.host.status.dpm
  }
  public set width(value: number) {
    if (this.host === undefined) {
      throw new Error('Host is undefined. Cannot compute width without host context.')
    }
    this.wmm = value / this.host.status.dpm
  }
  public abstract type: string
  public host: EditorHost
  id: string
  // 改为在类上声明属性，构造函数接收单个 options 对象（支持部分传入）
  public xmm: number = 5
  public ymm: number = 5
  public wmm: number = 30
  public hmm: number = 8
  public rotation: number = 0
  public scaleX: number = 1
  public scaleY: number = 1
  public visible: boolean = true
  public locked: boolean = false
  public draggable: boolean = true
  public transferable: boolean = true
  // 可用的缩放锚点；null 表示禁用所有缩放锚点（不可通过边框拖拽改变大小）
  public resizeAnchors: string[] | null = DEFAULT_ANCHORS
  // host 在元素未加入 editor 时可能不存在，保持可选

  constructor(host: EditorHost, options: Partial<BaseGraphicElementOptions> = {}) {
    // 位置记录的是mm 单位 对外暴露的根据dpm 转换px
    this.xmm = options.xmm ?? 5
    this.ymm = options.ymm ?? 5
    this.wmm = options.wmm ?? 30
    this.hmm = options.hmm ?? 8
    this.rotation = options.rotation ?? 0
    this.scaleX = options.scaleX ?? 1
    this.scaleY = options.scaleY ?? 1
    this.visible = options.visible ?? true
    this.locked = options.locked ?? false
    this.draggable = options.draggable ?? true
    this.transferable = options.transferable ?? true
    this.host = host
    this.id = uuidv4()
  }
  updateProperty(host: EditorHost, property: string, oldValue: any, newValue: any): void {
    host.executeCommand(new UpdatePropertyCommand(host, this, property, oldValue, newValue))
  }

  clone(): IGraphicElement {
    const snapshot = this.serialize()
    const elementManager = this.host.getPlugin('element-manager-plugin')
    const newElement = elementManager.createElement(this.type)
    newElement.deserialize(snapshot)
    newElement.id = uuidv4()
    return newElement
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width * this.scaleX,
      height: this.height * this.scaleY,
    }
  }

  deserialize(data: any): void {
    this.type = data.type
    this.xmm = data.xmm
    this.ymm = data.ymm
    this.wmm = data.wmm
    this.hmm = data.hmm
    this.rotation = data.rotation
    this.scaleX = data.scaleX
    this.scaleY = data.scaleY
    this.visible = data.visible
    this.locked = data.locked
    this.draggable = data.draggable
    this.transferable = data.transferable
  }

  serialize(): {
    id: string
    type: string
    xmm: number
    ymm: number
    wmm: number
    hmm: number
    rotation: number
    scaleX: number
    scaleY: number
    visible: boolean
    locked: boolean
    draggable: boolean
    transferable: boolean
    [key: string]: any
  } {
    return {
      type: this.type,
      id: this.id,
      xmm: this.xmm,
      ymm: this.ymm,
      wmm: this.wmm,
      hmm: this.hmm,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      locked: this.locked,
      draggable: this.draggable,
      transferable: this.transferable,
    }
  }
  // 获取转换的属性
  getTransformAttr(event: any): { oldAttrs: any; newAttrs: any } {
    const eAttrs = event.target.attrs
    const oldAttrs = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      scaleX: 1,
      scaleY: 1,
      rotation: this.rotation,
    }
    const newAttrs = {
      x: Math.round(eAttrs.x),
      y: Math.round(eAttrs.y),
      width: Math.round(this.width * eAttrs.scaleX),
      height: Math.round(this.height * eAttrs.scaleY),
      scaleX: 1,
      scaleY: 1,
      rotation: Math.round(eAttrs.rotation),
    }
    return { oldAttrs, newAttrs }
  }

  // 返回配置 供konva 使用
  public get config(): {
    id: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
    visible: boolean
    draggable: boolean
    [key: string]: any
  } {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      draggable: this.draggable,
    }
  }
}
