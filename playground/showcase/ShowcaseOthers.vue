<template>
  <section class="section">
    <h2 class="section__title">其他组件</h2>

    <div class="section__row">
      <span class="section__label">VkInput</span>
      <VkInput model-value="文本输入" />
    </div>

    <div class="section__row">
      <span class="section__label">VkInputNumber</span>
      <VkInputNumber :model-value="42" />
    </div>

    <div class="section__row">
      <span class="section__label">VkLabel+Input</span>
      <VkLabel>标签</VkLabel>
      <VkInput model-value="带标签" />
    </div>

    <div class="section__row">
      <span class="section__label">VkSelect</span>
      <VkSelect model-value="a">
        <option value="a">选项A</option>
        <option value="b">选项B</option>
      </VkSelect>
    </div>

    <div class="section__row">
      <span class="section__label">VkIcon</span>
      <VkIcon name="add" :size="20" />
      <VkIcon name="close" :size="20" />
      <VkIcon name="undo" :size="20" />
      <VkIcon name="redo" :size="20" />
    </div>
  </section>
</template>

<script setup lang="ts">
import VkInput from '@/components/ui/VkInput.vue'
import VkInputNumber from '@/components/ui/VkInputNumber.vue'
import VkLabel from '@/components/ui/VkLabel.vue'
import VkSelect from '@/components/ui/VkSelect.vue'
import VkIcon from '@/components/ui/VkIcon.vue'
</script>

<style scoped>
@use './shared.scss' as *;
</style>
