import type { Component } from 'vue'
import type { EditorHost } from '@/core'
import { BasePlugin } from './base-plugin'
import type { IGraphicElement } from './base'

export interface GraphicTypeRegistration {
  type: string
  render: () => Component
  createElement: () => IGraphicElement
  iconComponent?: Component
  typeDisplayName?: string
}

export interface PropertyPanelRegistration {
  graphicTypes: string[]
  render: () => Component
  isCanvas?: boolean
  isPublic?: boolean
}

export abstract class GraphicPlugin<T extends IGraphicElement> extends BasePlugin {
  public abstract graphicType: string
  public abstract graphicElement: new (host: EditorHost) => T
  public abstract shapeComponent: Component

  /**
   * 当前图形自身的属性面板 Vue 组件。
   *
   * 与 {@link shapeComponent} / {@link iconComponent} 风格一致：
   * 直接以组件引用声明，而非工厂函数。
   *
   * 基类会在 `onActivate` 时自动 emit 等价的 `property-panel:registered` 事件：
   * - `graphicTypes = [this.graphicType]`
   * - `render = () => this.propertyPanel`
   * - `isCanvas = false`
   * - `isPublic = false`
   *
   * 如需注册自身以外的图形类型、注册多个面板、或 `isCanvas = true` / `isPublic = true`，
   * 请改用旧 {@link propertyPanels} 字段或在独立插件的 `onInstall` 手动 emit。
   */
  public propertyPanel?: Component

  /**
   * 属性面板注册列表（旧 API，多面板与逃生通道）。
   *
   * @deprecated 请优先使用单数 {@link propertyPanel} 字段。本字段仅作为
   * 「多面板 / 为其他 graphicType 注册 / `isCanvas = true` / `isPublic = true`」
   * 场景下的逃生通道保留。新插件禁止使用本字段。
   *
   * 基类 `onActivate` 仍按现有逻辑遍历本数组 emit `property-panel:registered`，
   * 因此同一插件同时声明 `propertyPanel` 与 `propertyPanels` 时两者都会被注册。
   */
  public propertyPanels?: PropertyPanelRegistration[]
  public iconComponent?: Component
  public typeDisplayName?: string

  protected onActivate(): void {
    if (!this.host) return

    if (this.shapeComponent) {
      this.host.emit('graphic:registered', {
        type: this.graphicType,
        render: () => this.shapeComponent,
        iconComponent: this.iconComponent,
        typeDisplayName: this.typeDisplayName,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.propertyPanel) {
      this.host.emit('property-panel:registered', {
        graphicTypes: [this.graphicType],
        render: () => this.propertyPanel as Component,
        isCanvas: false,
        isPublic: false,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.propertyPanels) {
      for (const panel of this.propertyPanels) {
        this.host.emit('property-panel:registered', {
          graphicTypes: panel.graphicTypes,
          render: panel.render,
          isCanvas: panel.isCanvas ?? false,
          isPublic: panel.isPublic ?? false,
          source: 'graphic-plugin',
          timestamp: Date.now(),
        })
      }
    }

    this.host.emit('element:registered', {
      type: this.graphicType,
      createElement: () => new this.graphicElement(this.host),
      source: 'graphic-plugin',
      timestamp: Date.now(),
    })
  }

  protected onDeactivate(): void {
    if (!this.host) return

    if (this.shapeComponent) {
      this.host.emit('graphic:unregistered', {
        type: this.graphicType,
        render: () => this.shapeComponent,
        iconComponent: this.iconComponent,
        typeDisplayName: this.typeDisplayName,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.propertyPanel) {
      this.host.emit('property-panel:unregistered', {
        graphicTypes: [this.graphicType],
        render: () => this.propertyPanel as Component,
        isCanvas: false,
        isPublic: false,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.propertyPanels) {
      for (const panel of this.propertyPanels) {
        this.host.emit('property-panel:unregistered', {
          graphicTypes: panel.graphicTypes,
          render: panel.render,
          isCanvas: panel.isCanvas ?? false,
          isPublic: panel.isPublic ?? false,
          source: 'graphic-plugin',
          timestamp: Date.now(),
        })
      }
    }

    this.host.emit('element:unregistered', {
      type: this.graphicType,
      createElement: () => new this.graphicElement(this.host),
      source: 'graphic-plugin',
      timestamp: Date.now(),
    })
  }
}
