<template>
  <textarea
    ref="textareaRef"
    :class="['vkedit-input', 'vkedit-textarea', $props.class]"
    :value="modelValue"
    :disabled="disabled"
    :rows="rows"
    :placeholder="placeholder"
    spellcheck="false"
    @input="onInput"
    @blur="onBlur"
  ></textarea>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    rows?: number
    placeholder?: string
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    rows: 3,
    placeholder: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function onInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

function onBlur() {
  // 用于让父级在失焦时能感知输入结束（例如提交命令合并的最后一笔）
  emit('update:modelValue', textareaRef.value?.value ?? '')
}
</script>

<style scoped>
.vkedit-textarea {
  display: block;
  width: 100%;
  min-height: 56px;
  height: auto;
  resize: vertical;
  padding: var(--vkedit-spacing-sm);
  line-height: 1.4;
  font-family: var(--vkedit-font-sans);
  text-transform: none;
}
</style>