<template>
  <VkDropdown>
    <template #trigger>
      <VkButton size="sm">示例模板</VkButton>
    </template>
    <div class="template-menu">
      <div
        v-for="tpl in templates"
        :key="tpl.key"
        class="template-menu__item"
        @click="loadTemplate(tpl)"
      >
        <span class="template-menu__name">{{ tpl.name }}</span>
        <span class="template-menu__desc">{{ tpl.description }}</span>
      </div>
    </div>
  </VkDropdown>
</template>

<script setup lang="ts">
import type { EditorHost } from '@/core/editor-host'
import VkDropdown from '@/components/ui/VkDropdown.vue'
import VkButton from '@/components/ui/VkButton.vue'
import { templates, type SceneTemplate } from '../templates'

const props = defineProps<{ host: EditorHost }>()

function loadTemplate(tpl: SceneTemplate) {
  const elementsPlugin = props.host.getPlugin('graphic-registry-plugin')
  const hasContent = elementsPlugin.getAllElements().length > 0
  if (hasContent) {
    if (!window.confirm('当前画布有内容，加载模板将替换现有内容，是否继续？')) {
      return
    }
  }
  props.host.on('host:load-json:error', onError)
  props.host.loadJSON(JSON.stringify(tpl.data))
  props.host.off('host:load-json:error', onError)
  props.host.emit('stage:redraw', {})
}

function onError() {
  window.alert('模板加载失败，可能版本不兼容')
}
</script>

<style scoped>
.template-menu {
  min-width: 200px;
  padding: 4px;
}

.template-menu__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.template-menu__item:hover {
  background: var(--vkedit-color-bg-dark-hover);
}

.template-menu__name {
  font-size: 13px;
  color: var(--vkedit-color-text-dark);
  font-weight: 500;
}

.template-menu__desc {
  font-size: 11px;
  color: var(--vkedit-color-text-dark-secondary);
}
</style>
