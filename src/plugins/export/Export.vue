<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" title="下载">
          <Icon
            icon="material-symbols-light:file-export-outline-sharp"
            style="width: 25px; height: 25px"
          ></Icon>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>导出文件</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem @click="exportPdf">
            <span>PDF</span>
          </DropdownMenuItem>
          <!-- <DropdownMenuItem @click="">
            <span>Excel</span>
          </DropdownMenuItem> -->
          <DropdownMenuItem @click="exportImage">
            <span>PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="exportJSON">
            <span>JSON</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import type { SelectionPlugin } from '../selection-plugin'
import { AlignElementsCommand } from '@/commands'
import { Icon } from '@iconify/vue'
import { ButtonGroup } from '@/components/ui/button-group'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import konva from 'konva'
import type { ElementsPlugin } from '../elements-plugin'
import { jsPDF } from 'jspdf'

const { host } = defineProps<{ host: IEditorHost }>()

const hostState = host.getState()

// 下载
function exportImage() {
  const dataUrl = elementsToDataURL()
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
const exportJSON = () => {
  const jsonStr = host.toJSON()
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
const exportPdf = () => {
  // 获取元素的 DataURL
  const dataUrl = elementsToDataURL()
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
const elementsToDataURL = (): string => {
  // 先获取到所以元素
  const elementsPlugin = host.getPlugin<ElementsPlugin>('elements')
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
    const konvaNode = host.contentGroup.getNode().findOne(`#${element.id}`)
    if (konvaNode) {
      // 移动到临时 layer
      konvaNode.moveTo(layer)
    }
  })
  // 将临时stage导出为图片
  const dataUrl = stage.toDataURL({ pixelRatio: 2 })
  // 将元素移回原来的 group
  elements.forEach((element) => {
    const konvaNode = layer.findOne(`#${element.id}`)
    if (konvaNode) {
      konvaNode.moveTo(host.contentGroup.getNode())
    }
  })
  // 销毁临时 stage 和容器
  stage.destroy()
  document.body.removeChild(tempContainer)
  return dataUrl
}
</script>

<style scoped></style>
