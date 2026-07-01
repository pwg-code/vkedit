<template>
  <div class="showcase">
    <h1 class="showcase__title">UI 组件展示</h1>
    <ShowcaseButton />
    <ShowcaseToggle />
    <ShowcaseSwitch />
    <ShowcaseOthers />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ShowcasePage' })
import ShowcaseButton from './showcase/ShowcaseButton.vue'
import ShowcaseToggle from './showcase/ShowcaseToggle.vue'
import ShowcaseSwitch from './showcase/ShowcaseSwitch.vue'
import ShowcaseOthers from './showcase/ShowcaseOthers.vue'
</script>

<style scoped>
.showcase {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px;
  font-family: var(--vkedit-font-sans);
  color: #333;
}

.showcase__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}
</style>
