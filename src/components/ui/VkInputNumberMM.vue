<template>
  <div class="vkedit-input-mm">
    <button class="vkedit-input-mm__btn" @mousedown.prevent="decrement">&minus;</button>
    <div class="vkedit-input-mm__field">
      <input
        v-if="!isEdit"
        class="vkedit-input-mm__display"
        :value="`${displayValue} mm`"
        readonly
        @mousedown.prevent="startEdit"
      />
      <input
        v-show="isEdit"
        ref="inputRef"
        class="vkedit-input-mm__input"
        type="number"
        :value="displayValue"
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
import { computed, nextTick, ref } from 'vue'
import { round } from 'lodash'

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

const displayValue = computed(() => round(props.modelValue, 2))

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
    emit('update:modelValue', clampIfMin(round(val, 2)))
  }
  isEdit.value = false
}

function increment() {
  emit('update:modelValue', round(props.modelValue + props.step, 2))
}

function decrement() {
  const next = round(props.modelValue - props.step, 2)
  if (props.min === undefined || next >= props.min) {
    emit('update:modelValue', next)
  }
}
</script>

<style scoped>
.vkedit-input-mm__input::-webkit-outer-spin-button,
.vkedit-input-mm__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.vkedit-input-mm__input {
  -moz-appearance: textfield;
}
</style>
