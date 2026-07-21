import type { Component } from 'vue'
import type { EditorHost } from '@/core'
import { BasePlugin } from './base-plugin'
import type { IGraphicElement } from './base'

export interface GraphicTypeRegistration {
  type: string
  render: () => Component
  createElement: () => IGraphicElement
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
  public abstract toolComponent?: Component
  public abstract propertyPanels?: PropertyPanelRegistration[]

  protected onActivate(): void {
    if (!this.host) return

    if (this.toolComponent) {
      this.host.emit('graphic-tool:registered', {
        type: this.graphicType,
        render: () => this.toolComponent!,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.shapeComponent) {
      this.host.emit('graphic:registered', {
        type: this.graphicType,
        render: () => this.shapeComponent,
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

    if (this.toolComponent) {
      this.host.emit('graphic-tool:unregistered', {
        type: this.graphicType,
        render: () => this.toolComponent!,
        source: 'graphic-plugin',
        timestamp: Date.now(),
      })
    }

    if (this.shapeComponent) {
      this.host.emit('graphic:unregistered', {
        type: this.graphicType,
        render: () => this.shapeComponent,
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
