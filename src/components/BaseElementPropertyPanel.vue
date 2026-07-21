<template>
  <div class="vkedit-property__col-full vkedit-property__name-row">
    <VkLabel>名称</VkLabel>
    <VkInput
      ref="nameInputEl"
      v-model="nameInput"
      :maxlength="50"
      placeholder="留空将使用自动命名"
      @keydown.enter.prevent="handleNameCommit"
      @blur="handleNameCommit"
    />
  </div>
  <div class="vkedit-property__title">基础属性</div>
  <div></div>
  <!-- <div class="grid grid-cols-2 gap-4 items-center py-3"> -->
  <div>
    <VkLabel>X</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.x"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          updateProperty(element, 'x', value)
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>Y</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.y"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="
        (value: any) => {
          updateProperty(element, 'y', value)
        }
      "
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>宽</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.width"
      :min="0"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'width', value)"
    ></VkInputMM>
  </div>

  <div>
    <VkLabel>高</VkLabel>
    <VkInputMM
      :step="0.1"
      :model-value="element.height"
      :dpm="hostState.dpm"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'height', value)"
    ></VkInputMM>
  </div>
  <div>
    <VkLabel>缩放X</VkLabel>
    <VkInputNumber
      :model-value="element.scaleX"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleX', value)"
    />
  </div>
  <div>
    <VkLabel>缩放Y</VkLabel>
    <VkInputNumber
      :model-value="element.scaleY"
      :step="0.1"
      :min="0.5"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'scaleY', value)"
    />
  </div>
  <div>
    <VkLabel>角度</VkLabel>
    <VkInputNumber
      :model-value="element.rotation"
      :min="0"
      :max="359"
      @update:model-value="(value: any) => batchUpdateProperty(selection, 'rotation', value)"
    />
  </div>
  <div></div>
</template>

<script setup lang="ts">
import type { BaseGraphicElement } from '@/types'
import type { EditorHost } from '@/core'
import { computed, ref, watch } from 'vue'
import { VkInput, VkInputMM, VkInputNumber, VkLabel } from '@/components/ui'
import { useHostState, usePropertyCommand } from '@/hooks'

interface Props {
  host: EditorHost
  element: BaseGraphicElement
  selection: BaseGraphicElement[]
}

const { element, host, selection } = defineProps<Props>()

const layerPlugin = host.getPlugin('layer-manager-plugin') as import('@/plugins/layer-manager/layer-manager').LayerManagerPlugin

const displayName = computed(() => {
  const custom = (element as any).name
  if (typeof custom === 'string' && custom.trim().length > 0) return custom
  return layerPlugin.getElementDisplayName(element as any)
})

const { hostState } = useHostState(host)

const { updateProperty, batchUpdateProperty } = usePropertyCommand(host)

const nameInput = ref('')
const nameInputEl = ref<InstanceType<typeof VkInput> | null>(null)

watch(
  displayName,
  (val) => {
    const el = nameInputEl.value?.$el as HTMLInputElement | undefined
    if (el && document.activeElement === el) return
    nameInput.value = val
  },
  { immediate: true },
)

function handleNameCommit() {
  const raw = nameInput.value.trim()
  const next = raw.length === 0 ? null : raw.slice(0, 50)
  if ((element as any).name === next) return
  updateProperty(element as any, 'name', next)
  nameInput.value = next ?? displayName.value
}
</script>

<style scoped>
.vkedit-property__name-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
