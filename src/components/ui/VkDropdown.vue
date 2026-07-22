<template>
  <div class="vkedit-dropdown" ref="dropdownRef">
    <div @click="toggle">
      <slot name="trigger" />
    </div>
    <Teleport to="body">
      <div
        v-if="open"
        class="vkedit-dropdown__overlay"
        :data-vkedit-theme="theme"
        @click="open = false"
      />
      <Transition name="vkedit-scale">
        <div
          v-if="open"
          class="vkedit-dropdown__content"
          :data-vkedit-theme="theme"
          :style="{ top: contentStyle.top, left: contentStyle.left }"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, ref } from 'vue'
import { resolveVkeditTheme, type VkeditTheme } from '@/utils/theme'

const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const contentStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })
const theme = ref<VkeditTheme>('dark')

function toggle() {
  open.value = !open.value
  if (open.value) {
    theme.value = resolveVkeditTheme(dropdownRef.value)
    updatePosition()
  }
}

async function updatePosition() {
  await nextTick()
  if (!dropdownRef.value) return
  const rect = dropdownRef.value.getBoundingClientRect()
  contentStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  }
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped></style>
