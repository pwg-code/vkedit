import type { IEditorHost, IEditorPlugin, IGraphicElement, IGraphicType, IPluginTool } from '.'

export abstract class BaseGraphicElement implements IGraphicElement {
  public abstract type: string

  constructor(
    public id: string,
    public x: number,
    public y: number,
    public width: number = 300,
    public height: number = 80,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1,
    public visible: boolean = true,
    public locked: boolean = false,
    public draggable: boolean = true,
  ) {}

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: 10 * this.scaleX,
      height: 10 * this.scaleY,
    }
  }

  deserialize(data: any): void {
    Object.assign(this, data)
  }

  serialize() {
    return {
      type: this.type,
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      locked: this.locked,
    }
  }

  public abstract clone(): IGraphicElement
}
