您说得对！图形插件应该提供完整的Vue组件，让宿主负责渲染。这样架构更清晰，插件可以完全控制自己的UI表现。下面是改进的方案：

1. 更新类型定义

types.ts（扩展图形组件接口）

```typescript
// 图形组件接口

export interface IGraphicComponent {
  // 组件定义
  component: any // Vue组件
  props?: any // 组件props
  events?: any // 组件事件
}

// 扩展图形元素接口

export interface IGraphicElement {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  scaleX: number
  scaleY: number
  visible: boolean
  locked: boolean

  // 获取对应的Vue组件

  getComponent(): IGraphicComponent

  getBoundingBox(): BoundingBox

  clone(): IGraphicElement

  serialize(): any

  deserialize(data: any): void
}

// 扩展插件接口以支持图形组件

export interface IEditorPlugin {
  name: string

  version: string

  install(host: IEditorHost): void

  uninstall(): void

  activate?(): void

  deactivate?(): void

  // 注册图形类型

  registerGraphicTypes?(): IGraphicType[]

  // 提供工具栏工具

  getTools?(): IPluginTool[]
}

// 图形类型定义

export interface IGraphicType {
  type: string

  name: string

  icon: string

  component: any // 对应的Vue组件

  defaultProps: any // 默认属性

  createElement?(x: number, y: number): IGraphicElement
}
```

2. 图形组件基类

GraphicComponentBase.vue

```vue
<template>
  <v-group
    :config="groupConfig"
    @mousedown="handleMouseDown"
    @touchstart="handleMouseDown"
    @transformend="handleTransformEnd"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- 具体图形由子组件实现 -->

    <slot></slot>

    <!-- 选中状态 -->

    <selection-overlay
      v-if="selected && !element.locked"
      :element="element"
      @transform="handleSelectionTransform"
    />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { IGraphicElement, Point2D } from '../types'

import SelectionOverlay from './SelectionOverlay.vue'

interface Props {
  element: IGraphicElement

  selected: boolean
}

interface Emits {
  (e: 'select', elementId: string): void

  (e: 'transform', elementId: string, transforms: any): void

  (e: 'dragStart', elementId: string): void

  (e: 'dragEnd', elementId: string): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const groupConfig = computed(() => ({
  x: props.element.x,

  y: props.element.y,

  rotation: props.element.rotation,

  scaleX: props.element.scaleX,

  scaleY: props.element.scaleY,

  visible: props.element.visible,

  draggable: !props.element.locked && props.selected,

  name: `graphic-${props.element.id}`,
}))

const handleMouseDown = (event: any) => {
  event.cancelBubble = true

  if (props.element.locked) return

  emit('select', props.element.id)
}

const handleTransformEnd = (event: any) => {
  const node = event.target

  const transforms = {
    x: node.x(),

    y: node.y(),

    rotation: node.rotation(),

    scaleX: node.scaleX(),

    scaleY: node.scaleY(),
  }

  emit('transform', props.element.id, transforms)
}

const handleDragStart = (event: any) => {
  emit('dragStart', props.element.id)
}

const handleDragEnd = (event: any) => {
  emit('dragEnd', props.element.id)
}

const handleSelectionTransform = (transforms: any) => {
  emit('transform', props.element.id, transforms)
}
</script>
```

SelectionOverlay.vue

```vue
<template>
  <!-- 选中框 -->

  <v-rect :config="selectionConfig" name="selection-overlay" />

  <!-- 变换控制点 -->

  <v-circle
    v-for="(anchor, index) in transformAnchors"
    :key="`anchor-${index}`"
    :config="anchor"
    @mousedown="handleAnchorMouseDown(index, $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { IGraphicElement } from '../types'

interface Props {
  element: IGraphicElement
}

interface Emits {
  (e: 'transform', transforms: any): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const selectionConfig = computed(() => {
  const padding = 4

  const bbox = props.element.getBoundingBox()

  return {
    x: -padding,

    y: -padding,

    width: bbox.width + padding * 2,

    height: bbox.height + padding * 2,

    stroke: '#3498db',

    strokeWidth: 1,

    dash: [4, 4],

    listening: false,
  }
})

const transformAnchors = computed(() => {
  const bbox = props.element.getBoundingBox()

  const anchors = []

  const size = 6

  // 控制点定义...

  // 与之前类似的实现

  return anchors
})

const handleAnchorMouseDown = (anchorIndex: number, event: any) => {
  event.cancelBubble = true

  // 处理控制点拖拽逻辑
}
</script>
```

3. 具体图形组件示例

RectGraphic.vue

```vue
<template>
  <GraphicComponentBase
    :element="element"
    :selected="selected"
    @select="$emit('select', $event)"
    @transform="$emit('transform', $event)"
  >
    <v-rect :config="rectConfig" @click="handleClick" />
  </GraphicComponentBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { IGraphicElement } from '../types'

import GraphicComponentBase from './GraphicComponentBase.vue'

interface Props {
  element: IGraphicElement

  selected: boolean
}

interface Emits {
  (e: 'select', elementId: string): void

  (e: 'transform', elementId: string, transforms: any): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()

const rectConfig = computed(() => ({
  width: (props.element as any).width || 100,

  height: (props.element as any).height || 60,

  fill: (props.element as any).fill || '#3498db',

  stroke: (props.element as any).stroke || '#2980b9',

  strokeWidth: (props.element as any).strokeWidth || 2,

  cornerRadius: (props.element as any).cornerRadius || 0,
}))

const handleClick = (event: any) => {
  event.cancelBubble = true
}
</script>
```

CircleGraphic.vue

```vue
<template>
  <GraphicComponentBase
    :element="element"
    :selected="selected"
    @select="$emit('select', $event)"
    @transform="$emit('transform', $event)"
  >
    <v-circle :config="circleConfig" @click="handleClick" />
  </GraphicComponentBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { IGraphicElement } from '../types'

import GraphicComponentBase from './GraphicComponentBase.vue'

interface Props {
  element: IGraphicElement

  selected: boolean
}

interface Emits {
  (e: 'select', elementId: string): void

  (e: 'transform', elementId: string, transforms: any): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()

const circleConfig = computed(() => ({
  radius: (props.element as any).radius || 50,

  fill: (props.element as any).fill || '#e74c3c',

  stroke: (props.element as any).stroke || '#c0392b',

  strokeWidth: (props.element as any).strokeWidth || 2,
}))

const handleClick = (event: any) => {
  event.cancelBubble = true
}
</script>
```

4. 矩形插件完整实现

RectPlugin.ts

```typescript
import { BasePlugin } from './BasePlugin'
import { IEditorHost, IGraphicType, IGraphicElement } from './types'
import RectGraphic from './components/RectGraphic.vue'
import RectPropertyPanel from './components/RectPropertyPanel.vue'

// 矩形元素实现
class RectElement implements IGraphicElement {
  public readonly type = 'rect'
  constructor(
    public id: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public fill: string = '#3498db',
    public stroke: string = '#2980b9',
    public strokeWidth: number = 2,
    public cornerRadius: number = 0,
    public rotation: number = 0,
    public scaleX: number = 1,
    public scaleY: number = 1,
    public visible: boolean = true,
    public locked: boolean = false,
  ) {}

  getComponent() {
    return {
      component: RectGraphic,
      props: {
        element: this,
      },
    }
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width * this.scaleX,
      height: this.height * this.scaleY,
    }
  }

  clone(): IGraphicElement {
    return new RectElement(
      `rect-${Date.now()}`,
      this.x,
      this.y,
      this.width,
      this.height,
      this.fill,
      this.stroke,
      this.strokeWidth,
      this.cornerRadius,
      this.rotation,
      this.scaleX,
      this.scaleY,
      this.visible,
      this.locked,
    )
  }

  serialize() {
    return {
      type: this.type,
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      cornerRadius: this.cornerRadius,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      visible: this.visible,
      locked: this.locked,
    }
  }

  deserialize(data: any): void {
    Object.assign(this, data)
  }
}

export class RectPlugin extends BasePlugin {
  public name = 'rect-plugin'
  public version = '1.0.0'
  protected onInstall(): void {
    if (!this.host) return
    // 注册矩形图形类型
    this.host.emit('graphic-type:registered', this.getGraphicType())
    // 注册工具
    this.host.emit('tool:registered', {
      id: 'rect',
      name: 'rectangle',
      icon: '⬜',
      title: '矩形工具',
      description: '绘制矩形和正方形',
    })

    // 注册属性面板
    this.host.emit('property-panel:registered', {
      for: 'rect',
      component: RectPropertyPanel,
      title: '矩形属性',
    })
  }

  private getGraphicType(): IGraphicType {
    return {
      type: 'rect',
      name: '矩形',
      icon: '⬜',
      component: RectGraphic,
      defaultProps: {
        width: 100,
        height: 60,
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 2,
        cornerRadius: 0,
      },

      createElement: (x: number, y: number) => {
        return new RectElement(`rect-${Date.now()}`, x, y, 100, 60)
      },
    }
  }

  getTools() {
    return [
      {
        id: 'rect',
        name: 'rectangle',
        icon: '⬜',
        title: '矩形工具',
        description: '绘制矩形和正方形',
        category: 'drawing',
      },
    ]
  }
}
```

RectPropertyPanel.vue

```vue
<template>
  <div class="rect-property-panel">
    <h3>矩形属性</h3>

    <div class="property-group">
      <label>位置</label>

      <div class="property-row">
        <NumberInput label="X" :value="element.x" @change="updateProperty('x', $event)" />

        <NumberInput label="Y" :value="element.y" @change="updateProperty('y', $event)" />
      </div>
    </div>

    <div class="property-group">
      <label>尺寸</label>

      <div class="property-row">
        <NumberInput
          label="宽度"
          :value="element.width"
          @change="updateProperty('width', $event)"
        />

        <NumberInput
          label="高度"
          :value="element.height"
          @change="updateProperty('height', $event)"
        />
      </div>
    </div>

    <div class="property-group">
      <label>外观</label>

      <ColorInput label="填充颜色" :value="element.fill" @change="updateProperty('fill', $event)" />

      <ColorInput
        label="边框颜色"
        :value="element.stroke"
        @change="updateProperty('stroke', $event)"
      />

      <NumberInput
        label="边框宽度"
        :value="element.strokeWidth"
        @change="updateProperty('strokeWidth', $event)"
      />

      <NumberInput
        label="圆角半径"
        :value="element.cornerRadius"
        @change="updateProperty('cornerRadius', $event)"
      />
    </div>

    <div class="property-group">
      <label>变换</label>

      <NumberInput
        label="旋转角度"
        :value="element.rotation"
        @change="updateProperty('rotation', $event)"
      />

      <div class="property-row">
        <NumberInput
          label="缩放X"
          :value="element.scaleX"
          @change="updateProperty('scaleX', $event)"
        />

        <NumberInput
          label="缩放Y"
          :value="element.scaleY"
          @change="updateProperty('scaleY', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IGraphicElement } from '../types'

import NumberInput from './common/NumberInput.vue'

import ColorInput from './common/ColorInput.vue'

interface Props {
  element: IGraphicElement
}

const props = defineProps<Props>()

const updateProperty = (property: string, value: any) => {
  // 发送属性更新事件
  // 这里应该通过host的命令系统执行更新
}
</script>

<style scoped>
.rect-property-panel {
  padding: 12px;
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;

  font-weight: bold;

  margin-bottom: 8px;

  color: #2c3e50;
}

.property-row {
  display: flex;

  gap: 8px;
}
</style>
```

5. 更新CanvasView.vue以支持插件组件

```vue
<template>
  <div class="canvas-container">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @mousedown="handleStageMouseDown"
      @mousemove="handleStageMouseMove"
      @mouseup="handleStageMouseUp"
      @wheel="handleWheel"
    >
      <v-layer ref="mainLayerRef">
        <!-- 网格 -->

        <v-line
          v-if="host.state.showGrid"
          v-for="(line, index) in gridLines"
          :key="`grid-${index}`"
          :config="line"
        />

        <!-- 动态渲染图形组件 -->

        <component
          v-for="element in elements"
          :key="element.id"
          :is="getElementComponent(element)"
          :element="element"
          :selected="isSelected(element.id)"
          @select="handleElementSelect"
          @transform="handleElementTransform"
        />

        <!-- 选择框 -->

        <SelectionRectangle v-if="isSelecting" :start="selectionStart" :end="selectionEnd" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

import { IEditorHost, Point2D, IGraphicElement } from '../types'

import SelectionRectangle from './SelectionRectangle.vue'

interface Props {
  host: IEditorHost
}

const props = defineProps<Props>()

// 图形类型注册表

const graphicTypes = ref(new Map<string, any>())

// 注册图形类型

const registerGraphicType = (type: any) => {
  graphicTypes.value.set(type.type, type.component)
}

// 获取元素的Vue组件

const getElementComponent = (element: IGraphicElement) => {
  return graphicTypes.value.get(element.type) || 'div'
}

onMounted(() => {
  // 监听图形类型注册事件

  props.host.on('graphic-type:registered', registerGraphicType)

  // 从已注册插件加载图形类型

  // 这里需要遍历所有插件并调用registerGraphicTypes方法
})
</script>
```

架构优势

1. 真正的组件化：每个图形类型都是完整的Vue组件

2. 插件完全控制UI：插件可以自定义图形的渲染逻辑和交互行为

3. 更好的类型安全：TypeScript支持完整的类型检查

4. 易于扩展：新增图形类型只需实现对应的Vue组件

5. 属性面板集成：插件可以提供专用的属性编辑面板

这种架构让插件开发者可以完全控制图形的视觉表现和交互行为，同时宿主负责整体的画布管理和插件协调。
————————————————

                            版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。

原文链接：https://blog.csdn.net/weixin_50723234/article/details/152217776
