<template>
  <div :class="['vkedit-color-picker', disabled && 'is-disabled']">
    <div v-if="label" class="vkedit-color-picker__label">{{ label }}</div>
    <div class="vkedit-color-picker__field">
      <div
        class="vkedit-color-picker__swatch"
        :class="{ 'is-transparent': isNone }"
        @click="openPicker"
      >
        <span class="vkedit-color-picker__swatch-inner" :style="swatchStyle"></span>
      </div>
      <input
        ref="hexInput"
        class="vkedit-color-picker__hex vkedit-input"
        :value="hexDraft"
        :disabled="isNone || disabled"
        :placeholder="isNone ? '无填充' : '#rrggbb'"
        maxlength="7"
        spellcheck="false"
        @input="onHexInput"
        @blur="onHexBlur"
        @keydown.enter="commitHex"
      />
      <button
        v-if="allowNone"
        type="button"
        class="vkedit-color-picker__none-btn"
        :class="{ 'is-active': isNone }"
        :disabled="disabled"
        @click="toggleNone"
      >
        无填充
      </button>
    </div>
    <div v-if="message" :class="['vkedit-color-picker__message', messageLevel]">
      {{ message }}
    </div>
    <Teleport to="body">
      <div v-if="panelOpen" class="vkedit-color-picker__overlay" @click="closePicker"></div>
      <Transition name="vkedit-scale">
        <div
          v-if="panelOpen"
          class="vkedit-color-picker__panel"
          :style="{ top: panelStyle.top, left: panelStyle.left }"
          @mousedown.stop
        >
          <div class="vkedit-color-picker__panel-title">选择颜色</div>
          <div class="vkedit-color-picker__panel-native">
            <input
              ref="nativePicker"
              type="color"
              :value="currentHex"
              @input="onNativePick"
            />
          </div>
          <div class="vkedit-color-picker__panel-swatches">
            <button
              v-for="color in swatches"
              :key="color"
              type="button"
              class="vkedit-color-picker__panel-swatch"
              :style="{ background: color }"
              :title="color"
              @click="applySwatch(color, { closePanel: true })"
            ></button>
          </div>
          <div class="vkedit-color-picker__panel-actions">
            <button type="button" class="vkedit-color-picker__panel-btn" @click="closePicker">
              关闭
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  DEFAULT_SWATCHES,
  isFullHexColor,
  normalizeHex,
} from '@/utils/color'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    allowNone?: boolean
    disabled?: boolean
    warning?: string
    errorMessage?: string
    swatches?: string[]
  }>(),
  {
    modelValue: '#000000',
    allowNone: false,
    disabled: false,
    warning: '',
    errorMessage: '',
    swatches: () => DEFAULT_SWATCHES,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const panelOpen = ref(false)
const hexDraft = ref<string>('')
const isInvalid = ref(false)
const hexInput = ref<HTMLInputElement | null>(null)
const nativePicker = ref<HTMLInputElement | null>(null)
const panelStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })
// 记录最近一次有效填充色：进入“无填充”后用于恢复
const lastValidHex = ref<string>('#000000')

const isNone = computed(() => props.allowNone && (props.modelValue === null || props.modelValue === ''))

const currentHex = computed<string>(() => {
  if (isNone.value) return lastValidHex.value
  const mv = props.modelValue
  if (typeof mv === 'string' && isFullHexColor(mv)) {
    return mv.toLowerCase()
  }
  return lastValidHex.value
})

const swatchStyle = computed(() => {
  if (isNone.value) return {}
  return { background: currentHex.value }
})

const message = computed<string>(() => {
  if (isInvalid.value && props.errorMessage) return props.errorMessage
  if (props.warning && !isNone.value) return props.warning
  return ''
})

const messageLevel = computed(() => {
  if (isInvalid.value) return 'is-error'
  if (props.warning) return 'is-warning'
  return ''
})

function syncHexDraft() {
  if (isNone.value) {
    hexDraft.value = ''
    return
  }
  hexDraft.value = currentHex.value
}

function rememberLastValid(color: string) {
  const normalized = normalizeHex(color)
  if (normalized) {
    lastValidHex.value = normalized
  }
}

watch(
  () => props.modelValue,
  (value) => {
    isInvalid.value = false
    if (typeof value === 'string' && value !== '') {
      rememberLastValid(value)
    }
    syncHexDraft()
  },
  { immediate: true },
)

watch(
  () => props.allowNone,
  () => {
    syncHexDraft()
  },
)

function openPicker() {
  if (props.disabled) return
  panelOpen.value = true
  updatePanelPosition()
  nextTick(() => {
    nativePicker.value?.focus()
  })
}

function closePicker() {
  panelOpen.value = false
}

function toggleNone() {
  if (props.disabled) return
  if (isNone.value) {
    isInvalid.value = false
    emit('update:modelValue', lastValidHex.value)
  } else {
    // 进入无填充前记住当前色
    rememberLastValid(currentHex.value)
    isInvalid.value = false
    emit('update:modelValue', null)
  }
}

function applySwatch(color: string, options: { closePanel?: boolean } = {}) {
  const normalized = normalizeHex(color)
  if (!normalized) return
  isInvalid.value = false
  rememberLastValid(normalized)
  emit('update:modelValue', normalized)
  hexDraft.value = normalized
  if (options.closePanel) {
    panelOpen.value = false
  }
}

function onNativePick(event: Event) {
  const value = (event.target as HTMLInputElement).value
  applySwatch(value)
}

function onHexInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  hexDraft.value = raw
  if (raw === '') {
    isInvalid.value = false
    return
  }
  const normalized = normalizeHex(raw)
  if (normalized) {
    isInvalid.value = false
    rememberLastValid(normalized)
    if (normalized !== currentHex.value) {
      emit('update:modelValue', normalized)
    }
  } else {
    // 未达到完整 7 字符或格式错误：标记无效，但不在此时回写
    isInvalid.value = !isFullHexColor(raw)
  }
}

function onHexBlur() {
  if (isInvalid.value) {
    // 失焦时恢复最近一次有效值
    isInvalid.value = false
    syncHexDraft()
  }
}

function commitHex() {
  if (!isInvalid.value) return
  isInvalid.value = false
  syncHexDraft()
  hexInput.value?.blur()
}

async function updatePanelPosition() {
  await nextTick()
  const el = hexInput.value?.closest('.vkedit-color-picker') as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  const panelWidth = 220
  const margin = 8
  let left = rect.left
  if (left + panelWidth + margin > window.innerWidth) {
    left = Math.max(margin, window.innerWidth - panelWidth - margin)
  }
  panelStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${left}px`,
  }
}
</script>

<style scoped></style>