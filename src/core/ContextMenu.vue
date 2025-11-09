<template>
  <!-- 上下文菜单  根据右键鼠标位置显示 -->
  <div
    v-if="isShow"
    class="flex items-center absolute rounded-xl p-2 shadow-lg"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
    }"
  >
    <!-- 动态渲染上下文菜单 -->
    <component v-for="(menu, i) in contextMenus" :is="menu.render()" :key="i" :host="host" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { EditorHost } from '@/core'
import { VkButton } from '@/components'
import type { ContextMenuRegisteredEventData } from '@/types'
import type { ContextMenuManager } from '@/plugins';

const { host } = defineProps<{
  host: EditorHost
}>()

// 当前上下文菜单
const contextMenus = ref<ContextMenuRegisteredEventData[]>([])

// 当前显示的位置
const position = ref({ x: 0, y: 0 })

// 是否显示菜单
const isShow = ref(false)

onMounted(() => {
  // 监听上下文事件
  host.on('stage:contextmenu', (event) => {
    contextMenus.value = host
      .getPlugin<ContextMenuManager>('contextmenu-manager-plugin').getContextMenus()
    position.value = { x: event.evt.layerX, y: event.evt.layerY }
    isShow.value = true
  })
  // 监听点击事件 隐藏菜单
  host.on('stage:click', (event) => {
    if (event.evt.button === 2) return // 右键点击不隐藏
    isShow.value = false
  })
})
</script>

<style scoped></style>
