/*
预览插件
*/

import { BasePlugin } from '@/types'
import { ExportPlugin } from '@/plugins'
import PreviewButton from './PreviewButton.vue'

export class PreviewPlugin extends BasePlugin {
  name = 'preview-plugin'
  version = '1.0.0'

  protected onInstall(): void {
    // 向工具栏注册预览按钮
    if (!this.host) return
    this.host.emit('tool:registered', {
      toolName: 'preview',
      render: () => PreviewButton,
      source: 'preview-plugin-on-install',
      timestamp: Date.now(),
    })
  }

  // 预览
  handlePreview() {
    if (!this.host) return
    this.host.emit('preview:start', { source: '', timestamp: Date.now() })
    try {
      this.preview()
    } catch (error) {
      this.host.emit('preview:error', { source: '', timestamp: Date.now(), error })
      return
    }
    this.host.emit('preview:complete', { source: '', timestamp: Date.now() })
  }

  // 预览实现函数
  preview() {
    // 使用导出插件获得图片数据
    if (!this.host) return
    const exportPlugin = this.host.getPlugin<ExportPlugin>('export-plugin')
    const dataURL = exportPlugin.elementsToDataURL()
    // 使用image dataURL进行预览展示的逻辑
    const img = document.createElement('img')
    img.src = dataURL
    const previewWindow = window.open('', '_blank')
    previewWindow?.document.body.appendChild(img)
  }

  // 打印预览
  handlePrintPreview() {
    if (!this.host) return
    this.host.emit('preview:start', { source: '', timestamp: Date.now() })
    try {
      this.printPreview()
    } catch (error) {
      this.host.emit('preview:error', { source: '', timestamp: Date.now(), error })
      return
    }
    this.host.emit('preview:complete', { source: '', timestamp: Date.now() })
  }

  // 打印预览实现函数
  printPreview() {
    // 使用导出插件获得图片数据
    if (!this.host) return
    const exportPlugin = this.host.getPlugin<ExportPlugin>('export-plugin')
    const dataURL = exportPlugin.elementsToDataURL()
    // 使用image dataURL进行打印预览展示的逻辑
    const img = document.createElement('img')
    img.src = dataURL

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    document.body.appendChild(img)
    printWindow.document.body.appendChild(img)
    printWindow.focus()
    // 等待图片加载完成后再调用打印
    img.addEventListener('load', () => {
      printWindow.print()
    })
  }
}
