<template>
  <section class="section">
    <h2 class="section__title">VkButton</h2>

    <div v-for="variant in variants" :key="variant" class="section__row">
      <span class="section__label">{{ variant }}</span>
      <VkButton v-for="size in textSizes" :key="size" :variant="variant" :size="size">
        按钮
      </VkButton>
    </div>

    <div class="section__row">
      <span class="section__label">icon</span>
      <VkButton variant="default" size="icon"><VkIcon name="add" :size="16" /></VkButton>
      <VkButton variant="default" size="icon-sm"><VkIcon name="add" :size="14" /></VkButton>
      <VkButton variant="default" size="icon-lg"><VkIcon name="add" :size="18" /></VkButton>
    </div>

    <div class="section__row">
      <span class="section__label">disabled</span>
      <VkButton variant="default" size="default" disabled>按钮</VkButton>
      <VkButton variant="outline" size="sm" disabled>按钮</VkButton>
      <VkButton variant="ghost" size="default" disabled>按钮</VkButton>
    </div>

    <div class="section__dark">
      <div class="section__row">
        <span class="section__label" style="color: #ccc">ghost(dark)</span>
        <VkButton variant="ghost" size="default">按钮</VkButton>
        <VkButton variant="ghost" size="sm">按钮</VkButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import VkButton from '@/components/ui/VkButton.vue'
import VkIcon from '@/components/ui/VkIcon.vue'

const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
const textSizes = ['lg', 'default', 'sm', 'xs'] as const
</script>

<style scoped>
@use './shared.scss' as *;
</style>
