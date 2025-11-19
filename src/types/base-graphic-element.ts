import { UpdatePropertyCommand } from '@/commands'
import type { IGraphicElement } from '.'
import type { EditorHost } from '@/core'

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
  host?: EditorHost
}

export abstract class BaseGraphicElement implements IGraphicElement {
  public get x(): number {
    return this.xmm * (this.host?.state.dpm ?? 8)
  }
  public set x(value: number) {
    this.xmm = value / (this.host?.state.dpm ?? 8)
  }

  public get y(): number {
    return this.ymm * (this.host?.state.dpm ?? 8)
  }
  public set y(value: number) {
    this.ymm = value / (this.host?.state.dpm ?? 8)
  }

  public get height(): number {
    return this.hmm * (this.host?.state.dpm ?? 8)
  }
  public set height(value: number) {
    this.hmm = value / (this.host?.state.dpm ?? 8)
  }

  public get width(): number {
    return this.wmm * (this.host?.state.dpm ?? 8)
  }
  public set width(value: number) {
    this.wmm = value / (this.host?.state.dpm ?? 8)
  }
  public abstract type: string
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
  // host 在元素未加入 editor 时可能不存在，保持可选
  public host?: EditorHost

  constructor(options: Partial<BaseGraphicElementOptions> = {}) {
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
    this.host = options.host
    this.id = crypto.randomUUID()
  }
  updateProperty(host: EditorHost, property: string, oldValue: any, newValue: any): void {
    host.executeCommand(new UpdatePropertyCommand(this, host, property, oldValue, newValue))
  }

  clone(): IGraphicElement {
    throw new Error('Method not implemented.')
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
    this.id = data.id
    this.xmm = data.xmm
    this.ymm = data.ymm
    this.wmm = data.width
    this.hmm = data.height
    this.rotation = data.rotation
    this.scaleX = data.scaleX
    this.scaleY = data.scaleY
    this.visible = data.visible
    this.locked = data.locked
    this.draggable = data.draggable
    this.transferable = data.transferable
  }

  serialize() {
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
      x: eAttrs.x,
      y: eAttrs.y,
      width: this.width * eAttrs.scaleX,
      height: this.height * eAttrs.scaleY,
      scaleX: 1,
      scaleY: 1,
      rotation: eAttrs.rotation,
    }
    return { oldAttrs, newAttrs }
  }

  // 返回配置 供konva 使用
  public get config() {
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
      locked: this.locked,
    }
  }

}
