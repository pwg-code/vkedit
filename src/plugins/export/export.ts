/*
导出功能插件
*/

import { BasePlugin } from '@/types/base-plugin'
import Export from './Export.vue'
import jsPDF from 'jspdf'
import konva from 'konva'

export class ExportPlugin extends BasePlugin {
  name = 'export-plugin'
  version = '1.0.0'
  public pixelRatio: number = 2 // 导出图片的像素比
  constructor(host: EditorHost, pixelRatio: number = 2) {
    super(host)
    this.pixelRatio = pixelRatio // 导出图片的像素比
  }

  protected onInstall(): void {
    if (!this.host) return
    this.host?.emit('tool:registered', {
      toolName: 'export',
      render: () => Export,
      source: 'export-plugin-on-install',
      timestamp: Date.now(),
    })
  }

  // 导出excel
  handleExportExcel() {
    let prevented = false
    this.host?.emit('export:start', {
      timestamp: Date.now(),
      source: 'export-plugin',
      format: 'excel',
      prevent: () => {
        prevented = true
      },
    })

    // 如果被阻止,则不执行导出
    if (prevented) {
      return
    }

    // 这里不实现具体逻辑 只发送事件
  }

  // 处理导出图片
  handleExportImage() {
    let prevented = false
    this.host?.emit('export:start', {
      timestamp: Date.now(),
      source: 'export-plugin',
      format: 'png',
      prevent: () => {
        prevented = true
      },
    })

    // 如果被阻止,则不执行导出
    if (prevented) {
      return
    }

    try {
      this.exportImage()
    } catch (error) {
      // 发送导出失败事件
      this.host?.emit('export:error', {
        format: 'png',
        error,
        timestamp: Date.now(),
        source: 'export-plugin',
      })
      return
    }
    this.host?.emit('export:complete', {
      format: 'png',
      timestamp: Date.now(),
      source: 'export-plugin',
    })
  }

  // 处理导出 JSON
  handleExportJSON() {
    let prevented = false
    this.host?.emit('export:start', {
      format: 'json',
      timestamp: Date.now(),
      source: 'export-plugin',
      prevent: () => {
        prevented = true
      },
    })

    // 如果被阻止,则不执行导出
    if (prevented) {
      return
    }

    try {
      this.exportJSON()
    } catch (error) {
      this.host?.emit('export:error', {
        format: 'json',
        error,
        timestamp: Date.now(),
        source: 'export-plugin',
      })
      console.error('Export JSON failed:', error)
      return
    }
    this.host?.emit('export:complete', {
      format: 'json',
      timestamp: Date.now(),
      source: 'export-plugin',
    })
  }

  // 处理导出 PDF
  handleExportPdf() {
    let prevented = false
    this.host?.emit('export:start', {
      format: 'pdf',
      timestamp: Date.now(),
      source: 'export-plugin',
      prevent: () => {
        prevented = true
      },
    })

    // 如果被阻止,则不执行导出
    if (prevented) {
      return
    }

    try {
      this.exportPdf()
    } catch (error) {
      this.host?.emit('export:error', {
        format: 'pdf',
        error,
        timestamp: Date.now(),
        source: 'export-plugin',
      })
      return
    }
    this.host?.emit('export:complete', {
      format: 'pdf',
      timestamp: Date.now(),
      source: 'export-plugin',
    })
  }

  // 导出图片
  exportImage(mimeType: 'image/png' | 'image/jpeg' = 'image/png', background?: string) {
    const dataUrl = this.elementsToDataURL(mimeType, background)
    if (!dataUrl) return
    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataUrl
    link.download =
      mimeType == 'image/png' ? `canvas-${Date.now()}.png` : `canvas-${Date.now()}.jpg`
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
    const hostState = this.host?.status
    if (!hostState) return
    // 获取元素的 DataURL
    const dataUrl = this.elementsToDataURL()
    if (!dataUrl) return

    // 创建jsPDF实例 长宽为host内容区尺寸
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [hostState.width, hostState.height],
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, hostState.width, hostState.height)
    pdf.save(`canvas-${Date.now()}.pdf`)
  }

  // 将所以元素移动到临时舞台 并获取图片数据 再移动回原舞台
  elementsToDataURL(
    mimeType: 'image/png' | 'image/jpeg' = 'image/png',
    background?: string,
  ): string {
    const hostState = this.host?.status
    if (!hostState) return ''
    // 先获取到所以元素
    const elementsPlugin = this.host?.getPlugin('element-manager-plugin')
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
    // 根据background设置背景
    if (background) {
      layer.add(
        new konva.Rect({
          fill: background,
          width: hostState.width,
          height: hostState.height,
        }),
      )
    }
    // 将所有元素添加到临时的 Layer 中
    elements.forEach((element) => {
      const konvaNode = this.host?.contentGroup.getNode().findOne(`#${element.id}`)
      if (konvaNode) {
        // 移动到临时 layer
        konvaNode.moveTo(layer)
      }
    })
    // 将临时stage导出为图片
    const dataUrl = stage.toDataURL({ pixelRatio: this.pixelRatio, mimeType: mimeType })
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

// 将 ExportPlugin 注册到可扩展的 PluginMap（仅类型信息）
declare module '@/types' {
  interface PluginMap {
    'export-plugin': ExportPlugin
  }
}

// 将导出相关的事件添加到 EventMap（仅类型信息）
declare module '@/types' {
  interface EventMap {
    'export:start': (payload: ExportEventData) => void
    'export:complete': (payload: ExportEventData) => void
    'export:error': (payload: ExportEventData) => void
    'export:progress': (payload: ExportEventData) => void
  }
}

import type { BaseEventData } from '@/types'
import type { EditorHost } from '@/core'

export interface ExportEventData extends BaseEventData {
  format: 'png' | 'jpeg' | 'pdf' | 'json' | 'excel' | string
  error?: any
  // 阻止导出
  prevent?: () => void
}
