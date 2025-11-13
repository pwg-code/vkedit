/*
导出功能插件
*/

import { BasePlugin } from '@/types/base-plugin'
import Import from './Import.vue'
import { ElementManagerPlugin } from '@/plugins'

export class ImportPlugin extends BasePlugin {
  name = 'import-plugin'
  version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    this.host?.emit('tool:registered', {
      toolName: 'import',
      render: () => Import,
      source: 'import-plugin-on-install',
      timestamp: Date.now(),
    })
  }

  // 创建事件数据
  createEventData(format: string, error: any = null) {
    return {
      format,
      error,
      timestamp: Date.now(),
      source: 'import-plugin',
    }
  }

  // 弹窗选择文件导入json数据
  handleImportJSON() {
    //  弹窗选择文件逻辑
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json,application/json'
    fileInput.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files ? target.files[0] : null
      if (file) {
        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result as string
          this.importJSON(content)
        }
        reader.readAsText(file)
      }
    }
    fileInput.click()
  }

  // 导入json数据
  importJSON(data: string) {
    if (!this.host) return
    this.host?.emit('import:start', this.createEventData('json'))
    try {
      this.host.loadJSON(data)
      this.host?.emit('import:complete', this.createEventData('json'))
    } catch (error) {
      this.host?.emit('import:error', this.createEventData('json', error))
    }
  }

  // 导入Excel数据 只发送事件  不实现具体逻辑
  importExcel() {
    if (!this.host) return
    this.host?.emit('import:start', this.createEventData('excel'))
  }
}
