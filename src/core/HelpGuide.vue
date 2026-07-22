<template>
  <div ref="helpGuideRef" class="vkedit-help-guide">
    <button
      class="vkedit-help-guide__btn"
      @click.stop="toggle"
      title="快捷键帮助"
    >
      <IconHelp :width="20" />
    </button>

    <Teleport to="body">
      <div v-if="visible" class="vkedit-help-guide__overlay" :data-vkedit-theme="theme" @click="visible = false">
        <div class="vkedit-help-guide__popup" :data-vkedit-theme="theme" @click.stop>
          <div class="vkedit-help-guide__header">
            <span class="vkedit-help-guide__title">快捷键</span>
            <button class="vkedit-help-guide__close" @click="visible = false" title="关闭">
              <IconClose :width="18" />
            </button>
          </div>
          <div class="vkedit-help-guide__list">
            <div class="vkedit-help-guide__group">
              <div class="vkedit-help-guide__group-title">画布操作</div>
              <div class="vkedit-help-guide__item">
                <kbd>Space</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>左键拖拽</kbd>
                <span class="vkedit-help-guide__desc">平移画布</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Ctrl</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>滚轮</kbd>
                <span class="vkedit-help-guide__desc">缩放画布</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>滚轮</kbd>
                <span class="vkedit-help-guide__desc">垂直滚动</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Shift</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>滚轮</kbd>
                <span class="vkedit-help-guide__desc">水平滚动</span>
              </div>
            </div>
            <div class="vkedit-help-guide__group">
              <div class="vkedit-help-guide__group-title">编辑操作</div>
              <div class="vkedit-help-guide__item">
                <kbd>Ctrl</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>Z</kbd>
                <span class="vkedit-help-guide__desc">撤销</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Ctrl</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>Y</kbd>
                <span class="vkedit-help-guide__desc">重做</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Ctrl</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>C</kbd>
                <span class="vkedit-help-guide__desc">复制选中元素</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Ctrl</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>V</kbd>
                <span class="vkedit-help-guide__desc">粘贴元素</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Delete</kbd>
                <span class="vkedit-help-guide__desc">删除选中元素</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>&larr;</kbd>
                <kbd>&uarr;</kbd>
                <kbd>&darr;</kbd>
                <kbd>&rarr;</kbd>
                <span class="vkedit-help-guide__desc">移动选中元素</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>Alt</kbd>
                <span class="vkedit-help-guide__sep">+</span>
                <kbd>拖拽元素</kbd>
                <span class="vkedit-help-guide__desc">克隆元素</span>
              </div>
            </div>
            <div class="vkedit-help-guide__group">
              <div class="vkedit-help-guide__group-title">鼠标操作</div>
              <div class="vkedit-help-guide__item">
                <kbd>右键</kbd>
                <span class="vkedit-help-guide__desc">打开上下文菜单</span>
              </div>
              <div class="vkedit-help-guide__item">
                <kbd>拖拽元素</kbd>
                <span class="vkedit-help-guide__desc">移动元素位置</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { resolveVkeditTheme, type VkeditTheme } from '@/utils/theme'
import IconHelp from '~icons/material-symbols-light/help'
import IconClose from '~icons/material-symbols-light/close'

const visible = ref(false)
const helpGuideRef = ref<HTMLElement | null>(null)
const theme = ref<VkeditTheme>('dark')

const toggle = () => {
  visible.value = !visible.value
  if (visible.value) {
    theme.value = resolveVkeditTheme(helpGuideRef.value)
  }
}
</script>

<style scoped></style>
