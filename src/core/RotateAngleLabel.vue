<script setup lang="ts">
defineProps<{ angleLabel: { x: number; y: number; text: string } | null }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="angleLabel"
      class="vkedit-rotate-angle-label"
      :style="{ left: angleLabel.x + 'px', top: angleLabel.y + 'px' }"
    >
      {{ angleLabel.text }}
    </div>
  </Teleport>
</template>

<style>
.vkedit-rotate-angle-label {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1.2;
  border-radius: 4px;
  background: var(--vkedit-color-surface-solid, #fff);
  color: var(--vkedit-color-text, #111);
  border: 1px solid var(--vkedit-color-border, #ccc);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}
</style>
