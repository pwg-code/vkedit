import { BasePlugin, type ContextMenuRegisteredEventData } from "@/types"
import type { SelectionPlugin } from "./selection"



export class ContextMenuManager extends BasePlugin {

  public name = 'contextmenu-manager-plugin'
  public version = '1.0.0'
  // 上下文菜单列表
  public contextMenus: ContextMenuRegisteredEventData[] = []

  protected onInstall(): void {
    if (!this.host) return

    // 监听上下菜单注册事件
    this.host.on('context-menu:registered', this.handleContextMenuRegistered.bind(this))
  }

  protected onUninstall(): void {
    if (!this.host) return

    // 移除事件监听
    this.host.off('context-menu:registered', this.handleContextMenuRegistered.bind(this))
  }

  private handleContextMenuRegistered(event: ContextMenuRegisteredEventData): void {
    this.contextMenus.push(event)
  }

  // 获取上下文菜单
  public getContextMenus(): ContextMenuRegisteredEventData[] {
    if (!this.host) return []
    // 根据当前选中的图形类型过滤菜单
    const menus:ContextMenuRegisteredEventData[] = []
    const selection = this.host?.getPlugin<SelectionPlugin>('selection-plugin').getSelectionElements()
    // 公共菜单和画布菜单始终显示
    this.contextMenus.forEach(menu => {
      // 如果没有选择则显示画布菜单
      if (selection.length === 0 && menu.isCanvas) {
        menus.push(menu)
        return
      }
      // 如果是公共菜单且有选中图形则显示
      if (menu.isPublic && selection.length > 0) {
        menus.push(menu)
      } else {
        // 否则根据选中图形类型过滤
        if (selection && selection.length > 0) {
          const selectedTypes = new Set(selection.map(el => el.type))
          const intersect = menu.graphicTypes.filter(type => selectedTypes.has(type))
          if (intersect.length > 0) {
            menus.push(menu)
          }
        }
      }
    })
    return menus
  }

}
