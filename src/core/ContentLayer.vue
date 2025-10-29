<template>
  <!-- 内容图层 -->
  <v-layer ref="contentLayerRef" :config="contentLayerConfig">
    <!-- 内容区底板 -->
    <!-- 图形区域组 -->

    <v-rect :config="contentBgConfig"></v-rect>
    <v-group :config="contentGroupConfig" ref="groupRef">
      <component
        v-for="element in elements"
        :key="element.id"
        :is="graphicTypesPlugin?.getElementComponent(element.type)"
        :element="element"
        :host="host"
        @transformend="handleElementTransformEnd($event, element)"
        @dragend="handleDragEnd($event, element)"
        @transform="handleElementTransform($event, element)"
        />

        <!-- 事件会导致卡顿 -->

      <!-- <v-text v-for="element in elements" :config="element" :key="element.id" @transform="handleElementTransform($event, element)"></v-text> -->
      <!-- <v-text v-for="t,i in texts" :config="t" :key="i" ></v-text> -->
      <!-- <v-text v-for="t,i in texts" :config="t" :key="i" @transform="handleElementTransform($event, t)"></v-text> -->
      <v-transformer ref="transformerRef" :config="{}"></v-transformer>
    </v-group>
    <slot></slot>
  </v-layer>
</template>

<script setup lang="ts">
import useContentLayer from '@/hooks/use-content-layer'
import { TextElement, type ElementsPlugin } from '@/plugins';
import type { IEditorHost } from '@/types'
import { onMounted, ref } from 'vue';

const { host } = defineProps<{ host: IEditorHost }>()

const groupRef = ref()

// 内容图层
const {
  contentLayerConfig,
  contentLayerRef,
  transformerRef,
  contentBgConfig,
  contentGroupConfig,
  elements,
  graphicTypesPlugin,
  handleDragEnd,
  handleElementTransform,
  handleElementTransformEnd,
} = useContentLayer(host)

onMounted(()=>{
  groupRef.value.getNode().cache();
  // console.log('使用缓存');
  // test()
})


const texts = ref<any[]>([])
function test(){
  host.setState({
    widthMM: 210,
    heightMM: 297,
    dpi: 150,
    width: (210 * 150) / 25.4,
    height: (297 * 150) / 25.4,
    zoom: 0.4,
  })
  const hostState = host.getState()
  // 随机添加文本
  for (let i=0;i<5000;i++){
    const x = Math.random() * hostState.width
    const y = Math.random() * hostState.height
    // texts.value.push({
    //   x,
    //   y,
    //   text:'新建文本'
    // })
    const newText =  new TextElement(x,y)
    texts.value.push(newText)
    // host.getPlugin<ElementsPlugin>('elements')?.addElement(newText)
  }
}

</script>

<style scoped></style>
