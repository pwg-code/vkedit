<template>
  <div class="vkedit-input-mm">
    <button class="vkedit-input-mm__btn" @mousedown.prevent="decrement">&minus;</button>
    <div class="vkedit-input-mm__field">
      <input
        v-if="!isEdit"
        class="vkedit-input-mm__display"
        :value="`${modelValue} mm`"
        readonly
        @mousedown.prevent="startEdit"
      />
      <input
        v-show="isEdit"
        ref="inputRef"
        class="vkedit-input-mm__input"
        type="number"
        :value="modelValue"
        :step="step"
        :min="min"
        @blur="commitEdit"
        @keydown.enter="commitEdit"
      />
    </div>
    <button class="vkedit-input-mm__btn" @mousedown.prevent="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  step?: number
  min?: number
}>(), {
  step: 0.1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isEdit = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function clampIfMin(value: number): number {
  if (props.min !== undefined && value < props.min) return props.min
  return value
}

async function startEdit() {
  isEdit.value = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

function commitEdit(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  if (!isNaN(val)) {
    emit('update:modelValue', clampIfMin(val))
  }
  isEdit.value = false
}

function increment() {
  emit('update:modelValue', props.modelValue + props.step)
}

function decrement() {
  const next = props.modelValue - props.step
  if (props.min === undefined || next >= props.min) {
    emit('update:modelValue', next)
  }
}
</script>

<style scoped></style>
