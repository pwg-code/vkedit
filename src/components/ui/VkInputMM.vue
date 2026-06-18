<template>
  <div class="vkedit-input-mm">
    <button class="vkedit-input-mm__btn" @mousedown.prevent="decrement">&minus;</button>
    <div class="vkedit-input-mm__field">
      <input
        v-if="!isEdit"
        class="vkedit-input-mm__display"
        :value="`${valueMM} mm`"
        readonly
        @mousedown.prevent="startEdit"
      />
      <input
        v-show="isEdit"
        ref="inputRef"
        class="vkedit-input-mm__input"
        type="number"
        :value="valueMM"
        :step="step"
        :min="displayMin"
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
  dpm?: number
  step?: number
  min?: number
}>(), {
  dpm: 8,
  step: 0.1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const isEdit = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const valueMM = computed(() => round(props.modelValue / props.dpm, 2))

const displayMin = computed(() => {
  if (props.min !== undefined) return round(props.min / props.dpm, 2)
  return undefined
})

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
    emit('update:modelValue', clampIfMin(round(val * props.dpm, 2)))
  }
  isEdit.value = false
}

function increment() {
  emit('update:modelValue', round(props.modelValue + props.step * props.dpm, 2))
}

function decrement() {
  const next = round(props.modelValue - props.step * props.dpm, 2)
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
