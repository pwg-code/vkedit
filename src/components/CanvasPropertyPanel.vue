<template>
  <div>
    <div class="text-xl font-bold pb-2">画布属性</div>
    <ElForm>
      <ElDivider></ElDivider>
      <ElFormItem label="宽度">
        <ElInputNumber v-model="hostState.width" />
      </ElFormItem>
      <ElFormItem label="高度">
        <ElInputNumber v-model="hostState.height" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ref } from 'vue'
import { ElInputNumber, ElForm, ElFormItem, ElDivider } from 'element-plus'

const { host } = defineProps<{ host: IEditorHost }>()
const hostState = ref(host.getState())
</script>

<style scoped></style>
