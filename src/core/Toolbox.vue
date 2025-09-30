<template>
  <div class="p-5 flex gap-2">
    <template v-for="graphicType in graphicTypes">
      <ElButton
        @click="
          onCreate(graphicType[0], {
            x: 50,
            y: 50,
          })
        "
      >
        {{ graphicType[1].name }}{{ graphicType[1].icon }}</ElButton
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IEditorHost } from '@/types'
import { ElButton } from 'element-plus'
import { EditorEvents } from '../types/EventTypes'
import { onMounted, watch } from 'vue'
import useGraphicType from '@/hooks/useGraphicType'

const props = defineProps<{
  host: IEditorHost
}>()

const { graphicTypes, onCreate } = useGraphicType(props.host)
</script>
