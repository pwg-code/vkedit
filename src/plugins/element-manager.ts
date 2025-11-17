import { BasePlugin } from '../types/base-plugin'
import type { ElementRegisteredEventData, IGraphicElement, ElementTypeMap } from '../types'

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



  // 获取单个元素（支持按 type 过滤并进行类型推断）
  // 使用 ElementTypeMap 自动推断： getElement(id, 'rect') -> RectElement
  getElement<K extends keyof ElementTypeMap>(elementId: string, type: K): ElementTypeMap[K]
  // 显式泛型： getElement<RectElement>(id)
  getElement<T extends IGraphicElement = IGraphicElement>(elementId: string): T
  getElement(elementId: string, type?: string): IGraphicElement {
    const el = this.elements.get(elementId)
    if (!el){
      // 元素不存在 抛出异常
      throw new Error(`Element with ID ${elementId} does not exist.`)
    }
    return el as any
  }

  // 获取所有元素（支持按 type 过滤并进行类型推断）
  // 使用 ElementTypeMap 自动推断： getAllElements('rect') -> RectElement[]
  getAllElements<K extends keyof ElementTypeMap>(type: K): ElementTypeMap[K][]
  // 显式泛型： getAllElements<RectElement>()
  getAllElements<T extends IGraphicElement = IGraphicElement>(): T[]
  getAllElements(type?: string): IGraphicElement[] {
    const arr = Array.from(this.elements.values())
    if (type) {
      return arr.filter((e) => e.type === type) as any
    }
    return arr as any
  }

  // 创建元素实例（支持两种方式：）
  // 1) 通过可扩展的 ElementTypeMap 自动推断： createElement('rect') -> RectElement
  //    插件可以通过模块声明合并 (declare module '@/types') 来扩展 ElementTypeMap。
  // 2) 显式泛型调用以手动指定返回类型： createElement<RectElement>('rect')
  // 重载签名：先匹配映射，再匹配显式泛型，再回退到通用签名
  createElement<K extends keyof ElementTypeMap>(type: K): ElementTypeMap[K]
  createElement<T extends IGraphicElement = IGraphicElement>(type: string): T
  createElement(type: string): IGraphicElement
  createElement(type: string): IGraphicElement {
    const constructor = this.elementConstructors.get(type)
    if (constructor) {
      return constructor.createElement()
    }
    throw new Error(`Element type ${type} is not registered.`)
  }
}

// 将 ElementManagerPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'element-manager-plugin': ElementManagerPlugin
  }
}
