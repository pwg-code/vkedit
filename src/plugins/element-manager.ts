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
    // zIndex 自动赋值策略：若未显式赋值（仍为默认 0 且当前已有元素），则取"当前最大 + 1"置顶；
    // 第一个元素保持 0。导入 JSON 时若元素带显式 zIndex，此处 size 可能已 > 0 但其值非默认 0，会走保留分支。
    if (element.zIndex === 0 && this.elements.size > 0) {
      element.zIndex = this.getMaxZIndex() + 1
    }
    this.elements.set(element.id, element)
    this.host?.emit('element:added', {
      element,
      elementId: element.id,
      timestamp: Date.now(),
      source: 'element-manager-plugin',
    })
  }

  // 当前最大 zIndex；无元素时返回 -1，使下一个默认从 0 开始
  private getMaxZIndex(): number {
    let max = -1
    this.elements.forEach((e) => {
      if (e.zIndex > max) max = e.zIndex
    })
    return max
  }

  // 按 zIndex 降序返回元素列表（顶层在前）；zIndex 相同时按插入顺序稳定排序
  getOrderedElements(): IGraphicElement[] {
    const arr = Array.from(this.elements.values())
    // 稳定排序：用 Map 记录原始顺序索引，避免在元素实例上挂载临时属性
    const idxMap = new Map<string, number>()
    arr.forEach((e, i) => idxMap.set(e.id, i))
    arr.sort((a, b) => {
      if (b.zIndex !== a.zIndex) return b.zIndex - a.zIndex
      const ai = idxMap.get(a.id) ?? 0
      const bi = idxMap.get(b.id) ?? 0
      return ai - bi
    })
    return arr
  }

  // 归一化所有元素的 zIndex：按当前 zIndex 降序（顶层在前）结果重新分配连续值 0..n-1
  // 用于导入旧 JSON 后避免全部并列 0 导致顺序错乱，或处理重复/乱序 zIndex
  normalizeZIndices(): void {
    const ordered = this.getOrderedElements()
    const len = ordered.length
    // ordered[0] 是最顶层 → 最大 zIndex；逐项递减
    ordered.forEach((e, i) => {
      e.zIndex = len - 1 - i
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
    if (!el) {
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

  // 创建元素实例并加入编辑器（支持两种方式：）
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
      const newElement = constructor.createElement()
      return newElement
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
