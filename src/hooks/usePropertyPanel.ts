/* 主要是订阅图形类的插件注册事件，用于创建图形 */

import type { IEditorHost, IPropertyPanel } from '@/types'
import { EditorEvents } from '@/types/EventTypes'
import { onMounted, ref } from 'vue'

export default function (host: IEditorHost) {
  const propertyPanels = ref(new Map<string, IPropertyPanel>())

  // 根据选中的元素获取面板
  const getPanel = (panelName: string) => {
    return propertyPanels.value.get(panelName)?.getComponent()
  }

  onMounted(() => {
    // 监听属性面板注册事件
    host.on(EditorEvents.PROPERTY_PANEL_REGISTERED, (panel: IPropertyPanel) => {
      propertyPanels.value.set(panel.type, panel)
    })
    host.on(EditorEvents.PROPERTY_PANEL_UNREGISTERED, (type: string) => {
      propertyPanels.value.delete(type)
    })
  })

  return { propertyPanels, getPanel }
}
