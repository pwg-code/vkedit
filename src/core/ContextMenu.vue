<template>
  <!-- 上下文菜单  根据右键鼠标位置显示 -->
  <div
    v-if="isShow && contextMenus.length > 0"
    class="grid grid-cols-1 items-center absolute rounded shadow-lg border border-border bg-white w-[120px]"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
    }"
    @click="isShow = false"
  >
    <!-- 动态渲染上下文菜单 -->
    <component
      v-for="(menu, i) in contextMenus"
      :is="menu.render()"
      :key="i"
      :host="host"
      :element="element"
      :selection="selection"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import { VkButton } from '@/components'
import type { ContextMenuRegisteredEventData } from '@/plugins/context-menu-manager/types'
import type { IGraphicElement } from '@/types'

const { host } = defineProps<{
  host: EditorHost
}>()

// 当前上下文菜单
const contextMenus = ref<ContextMenuRegisteredEventData[]>([])

// 获取选择插件
const selectionPlugin = host.getPlugin('selection-plugin')

const element = ref<IGraphicElement | null>(null)
const selection = ref<IGraphicElement[]>([])

// 当前显示的位置
const position = ref({ x: 0, y: 0 })

// 是否显示菜单
const isShow = ref(false)

onMounted(() => {
  // 监听上下文事件
  host.on('stage:contextmenu', (event) => {
    contextMenus.value = host.getPlugin('context-menu-manager-plugin').getContextMenus()
    position.value = { x: event.evt.layerX, y: event.evt.layerY }
    isShow.value = true
    selection.value = selectionPlugin.getSelectionElements()
    element.value = selectionPlugin.getCurrentElement()
  })
  // 监听点击事件 隐藏菜单
  host.on('stage:click', (event) => {
    if (event.evt.button === 2) return // 右键点击不隐藏
    isShow.value = false
  })
})
</script>

<style scoped></style>
