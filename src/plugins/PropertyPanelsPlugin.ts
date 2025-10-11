import { EditorEvents } from '@/types/EventTypes'
import { BasePlugin } from '../types/BasePlugin'
import type { IPropertyPanel } from '../types'

export class PropertyPanelsPlugin extends BasePlugin {
  public name = 'property-panels'
  public version = '1.0.0'
  public propertyPanels: Map<string, IPropertyPanel> = new Map()

  protected onInstall(): void {
    if (!this.host) return
    this.host.on(EditorEvents.PROPERTY_PANEL_REGISTERED, (panel: IPropertyPanel) => {
      this.propertyPanels.set(panel.type, panel)
    })
  }

  protected onUninstall(): void {
    if (!this.host) return
    this.host.off(EditorEvents.PROPERTY_PANEL_REGISTERED, (panel: IPropertyPanel) => {
      this.propertyPanels.set(panel.type, panel)
    })
  }

  // 根据选中的元素获取面板
  getPanel(panelName: string) {
    return this.propertyPanels.get(panelName)?.getComponent()
  }
}
