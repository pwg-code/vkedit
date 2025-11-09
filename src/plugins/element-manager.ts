import { BasePlugin } from '../types/base-plugin'
import type { ElementRegisteredEventData, IGraphicElement } from '../types'
import { RemoveElementCommand, AddElementCommand } from '@/commands'
import type { Component } from 'vue'

export class ElementManagerPlugin extends BasePlugin {
  public name = 'element-manager-plugin'
  public version = '1.0.0'
  public elements: Map<string, IGraphicElement> = new Map()
  // 元素构造器
  private elementConstructors: Map<string, ElementRegisteredEventData> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    // 监听元素类 注册事件 收集类 以便后续恢复时创建元素实例
    this.host.on('element:registered', (data) => {
      this.elementConstructors.set(data.type, data)
    })
  }

  protected onUninstall(): void {
    if (!this.host) return
  }

  // 添加元素
  addElement(element: IGraphicElement): void {
    this.elements.set(element.id, element)
    this.host?.emit('element:added', {
      element,
      elementId: element.id,
      timestamp: Date.now(),
      source: 'element-manager-plugin',
    })
  }

  // 移除元素
  removeElement(elementId: string): void {
    const element = this.elements.get(elementId)
    if (element) {
      this.elements.delete(elementId)
      this.host?.emit('element:removed', {
        element,
        elementId: element.id,
        timestamp: Date.now(),
        source: 'element-manager-plugin',
      })
    }
  }

  getElement(elementId: string): IGraphicElement | undefined {
    return this.elements.get(elementId)
  }

  // 获取所有元素
  getAllElements(): IGraphicElement[] {
    return Array.from(this.elements.values())
  }

  // 创建元素实例
  createElement(type: string): IGraphicElement {
    const constructor = this.elementConstructors.get(type)
    if (constructor) {
      return constructor.createElement()
    }
    throw new Error(`Element type ${type} is not registered.`)
  }
}
