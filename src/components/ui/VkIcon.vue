<template>
  <span
    class="vkedit-icon"
    :style="iconStyle"
    v-html="svgContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const icons = import.meta.glob<string>('@/assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
})

interface Props {
  name: string
  size?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  size: '20px',
})

const svgContent = computed(() => {
  const key = Object.keys(icons).find((k) => k.endsWith(`/${props.name}.svg`))
  if (!key) {
    console.warn(`[VkIcon] Icon not found: ${props.name}`)
    return ''
  }
  return icons[key]
})

const sizeValue = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  return props.size
})

const iconStyle = computed(() => ({
  width: sizeValue.value,
  height: sizeValue.value,
}))
</script>

<style scoped>
.vkedit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.vkedit-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}
</style>
