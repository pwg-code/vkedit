<template>
  <div class="vkedit-dropdown" ref="dropdownRef">
    <div @click="toggle">
      <slot name="trigger" />
    </div>
    <Teleport to="body">
      <div
        v-if="open"
        class="vkedit-dropdown__overlay"
        @click="open = false"
      />
      <Transition name="vkedit-scale">
        <div
          v-if="open"
          class="vkedit-dropdown__content"
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

const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const contentStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

function toggle() {
  open.value = !open.value
  if (open.value) {
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
