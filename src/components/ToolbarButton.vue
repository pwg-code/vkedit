<template>
  <button
    class="toolbar-button"
    :class="buttonClasses"
    :title="computedTitle"
    :disabled="disabled"
    :aria-label="computedTitle"
    :aria-pressed="active"
    @click="handleClick"
    @contextmenu="handleRightClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 图标区域 -->

    <span class="button-icon" :class="iconClasses">
      <span v-if="icon" class="icon-emoji">{{ icon }}</span>
      <svg
        v-else-if="svgIcon"
        class="icon-svg"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path :d="svgIcon" />
      </svg>

      <span v-else class="icon-placeholder">?</span>
    </span>

    <!-- 标签文字 -->
    <span v-if="showLabel && label" class="button-label">
      {{ label }}
    </span>

    <!-- 快捷键提示 -->
    <span v-if="showShortcut && shortcut" class="button-shortcut">
      {{ shortcut }}
    </span>

    <!-- 徽章/状态指示器 -->

    <span v-if="badge" class="button-badge" :class="badgeType">
      {{ badge }}
    </span>

    <!-- 下拉箭头 -->
    <span v-if="hasDropdown" class="dropdown-arrow"> ▼ </span>

    <!-- 加载指示器 -->
    <span v-if="loading" class="loading-indicator">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  // 图标类型
  icon?: string // emoji 图标
  svgIcon?: string // SVG path 数据
  iconSize?: number // 图标尺寸
  // 文字内容
  label?: string // 按钮文字
  title?: string // 提示文字

  // 状态
  active?: boolean // 是否激活状态
  disabled?: boolean // 是否禁用
  loading?: boolean // 加载状态

  // 显示选项
  showLabel?: boolean // 是否显示文字
  showShortcut?: boolean // 是否显示快捷键
  size?: 'small' | 'medium' | 'large' // 按钮尺寸
  variant?: 'default' | 'primary' | 'danger' | 'success' // 按钮变体

  // 附加功能
  shortcut?: string // 快捷键显示
  badge?: string | number // 徽章内容
  badgeType?: 'info' | 'warning' | 'error' | 'success' // 徽章类型
  hasDropdown?: boolean // 是否有下拉菜单
  tooltipDelay?: number // 提示延迟
}

interface Emits {
  (e: 'click', event: MouseEvent): void
  (e: 'right-click', event: MouseEvent): void
  (e: 'mouse-enter', event: MouseEvent): void
  (e: 'mouse-leave', event: MouseEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  loading: false,
  showLabel: false,
  showShortcut: false,
  size: 'medium',
  variant: 'default',
  iconSize: 16,
  badgeType: 'info',
  hasDropdown: false,
  tooltipDelay: 300,
})

const emit = defineEmits<Emits>()

// 响应式状态
const isHovered = ref(false)
const isFocused = ref(false)

// 计算属性
const computedTitle = computed(() => {
  if (props.title) return props.title
  if (props.label) return props.label
  return ''
})

const buttonClasses = computed(() => [
  `size-${props.size}`,
  `variant-${props.variant}`,
  {
    active: props.active,
    disabled: props.disabled,
    loading: props.loading,
    hovered: isHovered.value,
    focused: isFocused.value,
    'has-dropdown': props.hasDropdown,
    'has-badge': props.badge,
    'icon-only': !props.showLabel && !props.label,
  },
])

const iconClasses = computed(() => ({
  'has-emoji': props.icon,
  'has-svg': props.svgIcon,
  loading: props.loading,
}))

// 事件处理

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleRightClick = (event: MouseEvent) => {
  event.preventDefault()
  if (!props.disabled && !props.loading) {
    emit('right-click', event)
  }
}

const handleMouseEnter = (event: MouseEvent) => {
  isHovered.value = true
  emit('mouse-enter', event)
}

const handleMouseLeave = (event: MouseEvent) => {
  isHovered.value = false
  emit('mouse-leave', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<style scoped>
.toolbar-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--button-bg, #f8f9fa);
  color: var(--button-color, #495057);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  user-select: none;
  outline: none;
  gap: 6px;
  padding: 8px 12px;
  min-height: 36px;
}

.toolbar-button:hover:not(.disabled):not(.loading) {
  background: var(--button-hover-bg, #e9ecef);
  border-color: var(--button-hover-border, #dee2e6);
  color: var(--button-hover-color, #495057);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-button:focus:not(.disabled):not(.loading) {
  outline: 2px solid var(--button-focus-outline, #4dabf7);
  outline-offset: 1px;
}

.toolbar-button.active:not(.disabled) {
  background: var(--button-active-bg, #4dabf7);
  border-color: var(--button-active-border, #339af0);
  color: var(--button-active-color, #ffffff);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--button-disabled-bg, #f8f9fa);
  color: var(--button-disabled-color, #adb5bd);
}

.toolbar-button.loading {
  cursor: wait;
  opacity: 0.7;
}

/* 尺寸变体 */

.toolbar-button.size-small {
  padding: 6px 8px;
  min-height: 28px;
  font-size: 12px;
  gap: 4px;
}

.toolbar-button.size-medium {
  padding: 8px 12px;
  min-height: 36px;
  font-size: 14px;
  gap: 6px;
}

.toolbar-button.size-large {
  padding: 12px 16px;
  min-height: 44px;
  font-size: 16px;
  gap: 8px;
}

/* 颜色变体 */

.toolbar-button.variant-default {
  --button-bg: #f8f9fa;
  --button-color: #495057;
  --button-hover-bg: #e9ecef;
  --button-hover-border: #dee2e6;
  --button-active-bg: #4dabf7;
  --button-active-color: #ffffff;
  --button-focus-outline: #4dabf7;
}

.toolbar-button.variant-primary {
  --button-bg: #4dabf7;
  --button-color: #ffffff;
  --button-hover-bg: #339af0;
  --button-active-bg: #1c7ed6;
  --button-focus-outline: #4dabf7;
}

.toolbar-button.variant-danger {
  --button-bg: #fa5252;
  --button-color: #ffffff;
  --button-hover-bg: #e03131;
  --button-active-bg: #c92a2a;
  --button-focus-outline: #fa5252;
}

.toolbar-button.variant-success {
  --button-bg: #40c057;
  --button-color: #ffffff;
  --button-hover-bg: #2f9e44;
  --button-active-bg: #2b8a3e;
  --button-focus-outline: #40c057;
}

/* 图标样式 */

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.toolbar-button:hover:not(.disabled) .button-icon {
  transform: scale(1.1);
}

.toolbar-button.active:not(.disabled) .button-icon {
  transform: scale(1.05);
}

.icon-emoji {
  font-size: 1.2em;
  line-height: 1;
}

.icon-svg {
  flex-shrink: 0;
}

.icon-placeholder {
  width: 16px;
  height: 16px;
  background: #dee2e6;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #adb5bd;
}

/* 标签样式 */

.button-label {
  white-space: nowrap;
  font-weight: 500;
}

.toolbar-button.size-small .button-label {
  font-size: 11px;
}

.toolbar-button.size-large .button-label {
  font-size: 15px;
}

/* 快捷键样式 */

.button-shortcut {
  font-size: 11px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  margin-left: auto;
}

.toolbar-button.size-small .button-shortcut {
  font-size: 9px;
  padding: 1px 3px;
}

/* 徽章样式 */

.button-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
  line-height: 1;
}

.button-badge.info {
  background: #4dabf7;
  color: white;
}

.button-badge.warning {
  background: #fab005;
  color: white;
}

.button-badge.error {
  background: #fa5252;
  color: white;
}

.button-badge.success {
  background: #40c057;
  color: white;
}

.toolbar-button.size-small .button-badge {
  font-size: 8px;
  padding: 1px 3px;
  min-width: 14px;
}

/* 下拉箭头 */

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 2px;
  transition: transform 0.2s ease;
}

.toolbar-button.has-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  gap: 2px;
  align-items: center;
}

.loading-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 仅图标模式 */

.toolbar-button.icon-only {
  padding: 8px;
  aspect-ratio: 1;
}

.toolbar-button.icon-only.size-small {
  padding: 6px;
}

.toolbar-button.icon-only.size-large {
  padding: 12px;
}

/* 紧凑模式（用于工具栏分组） */

.toolbar-button.compact {
  border-radius: 0;
  margin-left: -1px;
}

.toolbar-button.compact:first-child {
  border-radius: 6px 0 0 6px;
  margin-left: 0;
}

.toolbar-button.compact:last-child {
  border-radius: 0 6px 6px 0;
}

.toolbar-button.compact:only-child {
  border-radius: 6px;
}

/* 响应式设计 */

@media (max-width: 768px) {
  .toolbar-button {
    min-height: 32px;
    padding: 6px 8px;
    font-size: 13px;
  }

  .toolbar-button.size-large {
    min-height: 40px;
    padding: 10px 14px;
  }

  .button-shortcut {
    display: none; /* 在小屏幕上隐藏快捷键提示 */
  }
}

/* 高对比度模式支持 */

@media (prefers-contrast: high) {
  .toolbar-button {
    border-width: 2px;
  }

  .toolbar-button.active {
    border-style: inset;
  }
}

/* 减少动画模式 */

@media (prefers-reduced-motion: reduce) {
  .toolbar-button {
    transition: none;
  }

  .button-icon {
    transition: none;
  }

  .loading-dot {
    animation: none;
  }
}
</style>
