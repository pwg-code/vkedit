<template>
  <section class="section">
    <h2 class="section__title">VkSwitch</h2>

    <div class="section__row">
      <span class="section__label">on/off</span>
      <VkSwitch :model-value="false" />
      <VkSwitch :model-value="true" />
    </div>

    <div class="section__row">
      <span class="section__label">disabled</span>
      <VkSwitch :model-value="false" disabled />
      <VkSwitch :model-value="true" disabled />
    </div>
  </section>
</template>

<script setup lang="ts">
import VkSwitch from '@/components/ui/VkSwitch.vue'
</script>

<style scoped>
@use './shared.scss' as *;
</style>
