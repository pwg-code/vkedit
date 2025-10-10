<template>
  <ElButton v-bind="$attrs" :disabled="isFocused" style="font-size: 20px" :title="title" text>{{
    icon
  }}</ElButton>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton } from 'element-plus'

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

// 响应式状态
const isHovered = ref(false)
const isFocused = ref(false)
</script>

<style scoped></style>
