<template>
  <section class="section">
    <h2 class="section__title">VkToggle</h2>

    <div v-for="size in sizes" :key="size" class="section__row">
      <span class="section__label">{{ size }}</span>
      <VkToggle :model-value="true" :size="size">加粗</VkToggle>
      <VkToggle :model-value="false" :size="size">加粗</VkToggle>
      <VkToggle :model-value="true" :size="size">
        <VkIcon name="add" :size="14" />
      </VkToggle>
      <VkToggle :model-value="false" :size="size">
        <VkIcon name="close" :size="14" />
      </VkToggle>
    </div>

    <div class="section__dark">
      <div class="section__row">
        <span class="section__label" style="color: #ccc">toggle(dark)</span>
        <VkToggle :model-value="true" size="default">加粗</VkToggle>
        <VkToggle :model-value="false" size="default">加粗</VkToggle>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import VkToggle from '@/components/ui/VkToggle.vue'
import VkIcon from '@/components/ui/VkIcon.vue'

const sizes = ['lg', 'default', 'sm'] as const
</script>

<style scoped>
@use './shared.scss' as *;
</style>
