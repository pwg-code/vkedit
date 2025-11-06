/*
导出功能插件
*/

import { EditorEvents } from '@/types/event-types'
import { BasePlugin } from '@/types/base-plugin'
import type { IToolbar } from '@/types'
import Export from './Export.vue'
import jsPDF from 'jspdf'
import { ElementManagerPlugin } from '@/plugins'
import konva from 'konva'

export class ExportPlugin extends BasePlugin {
  name = 'export-plugin'
  version = '1.0.0'

  protected onInstall(): void {
    if (!this.host) return
    this.host?.emit(EditorEvents.TOOL_REGISTERED, this.getTool())
  }

  private getTool(): IToolbar {
    return {
      name: 'export-plugin',
      getComponent() {
        return Export
      },
    }
  }

  // 处理导出图片
  handleExportImage() {
    this.host?.emit(EditorEvents.EXPORT_START, { format: 'png' })
    try {
      this.exportImage()
    } catch (error) {
      // 发送导出失败事件
      this.host?.emit(EditorEvents.EXPORT_ERROR, { format: 'png', error })
      return
    }
    this.host?.emit(EditorEvents.EXPORT_COMPLETE, { format: 'png' })
  }

  // 处理导出 JSON
  handleExportJSON() {
    this.host?.emit(EditorEvents.EXPORT_START, { format: 'json' })
    try {
      this.exportJSON()
    } catch (error) {
      this.host?.emit(EditorEvents.EXPORT_ERROR, { format: 'json', error })
      return
    }
    this.host?.emit(EditorEvents.EXPORT_COMPLETE, { format: 'json' })
  }

  // 处理导出 PDF
  handleExportPdf() {
    this.host?.emit(EditorEvents.EXPORT_START, { format: 'pdf' })
    try {
      this.exportPdf()
    } catch (error) {
      this.host?.emit(EditorEvents.EXPORT_ERROR, { format: 'pdf', error })
      return
    }
    this.host?.emit(EditorEvents.EXPORT_COMPLETE, { format: 'pdf' })
  }

  // 导出图片
  exportImage() {
    const dataUrl = this.elementsToDataURL()
    if (!dataUrl) return
    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `canvas-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 导出 JSON
  exportJSON() {
    const jsonStr = this.host?.toJSON()
    if (!jsonStr) return
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `canvas-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 处理 PDF 导出
  exportPdf() {
    const hostState = this.host?.getState()
    if (!hostState) return
    // 获取元素的 DataURL
    const dataUrl = this.elementsToDataURL()
    if (!dataUrl) return

    // 创建jsPDF实例 长宽为host内容区尺寸
    const pdf = new jsPDF({
      unit: 'px',
      format: [hostState.width, hostState.height],
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, hostState.width, hostState.height)
    pdf.save(`canvas-${Date.now()}.pdf`)
  }

  // 将所以元素移动到临时舞台 并获取图片数据 再移动回原舞台
  elementsToDataURL(pixelRatio: number = 1): string {
    const hostState = this.host?.getState()
    if (!hostState) return ''
    // 先获取到所以元素
    const elementsPlugin = this.host?.getPlugin<ElementManagerPlugin>('element-manager-plugin')
    if (!elementsPlugin) return ''
    const elements = elementsPlugin.getAllElements()
    // 创建一个临时的容器
    const tempContainer = document.createElement('div')
    tempContainer.id = 'temp-stage-container'
    document.body.appendChild(tempContainer)
    // 创建临时的 Konva.Stage 和 Konva.Layer
    const stage = new konva.Stage({
      container: 'temp-stage-container', // 这里需要一个容器，但我们不会把它添加到 DOM 中
      width: hostState.width,
      height: hostState.height,
    })
    const layer = new konva.Layer()
    stage.add(layer)

    // 将所有元素添加到临时的 Layer 中
    elements.forEach((element) => {
      const konvaNode = this.host?.contentGroup.getNode().findOne(`#${element.id}`)
      if (konvaNode) {
        // 移动到临时 layer
        konvaNode.moveTo(layer)
      }
    })
    // 将临时stage导出为图片
    const dataUrl = stage.toDataURL({ pixelRatio: pixelRatio })
    // 将元素移回原来的 group
    elements.forEach((element) => {
      const konvaNode = layer.findOne(`#${element.id}`)
      if (konvaNode) {
        konvaNode.moveTo(this.host?.contentGroup.getNode())
      }
    })
    // 销毁临时 stage 和容器
    stage.destroy()
    document.body.removeChild(tempContainer)
    return dataUrl
  }
}
